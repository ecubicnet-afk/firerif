"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatYen } from "@/lib/utils";
import { evaluateExpression } from "@/lib/budget-utils";
import {
  LIVING_EXPENSE_CATEGORIES,
  FIXED_COST_CATEGORIES,
  getExpenseGroup,
} from "@/lib/budget-categories";
import { BudgetProgressBar } from "./BudgetProgressBar";
import { Pencil, Check, X, Sparkles } from "lucide-react";
import type { BudgetPlan, BudgetEntry, MergedEntry } from "@/hooks/use-budget";

// Plan categories used by ThreeStepPlan — exclude from budget display
const PLAN_CATEGORIES = new Set(["ベース収支目標", "変動費削減目標", "固定費削減目標"]);

interface Props {
  year: number;
  month: number;
  totals: {
    livingExpense: number;
    fixedCost: number;
    specialExpense: number;
    expense: number;
  };
  plans: BudgetPlan[];
  entries: BudgetEntry[];
  expenseByCategory: { category: string; amount: number; group: string }[];
  mergedFixedCosts: MergedEntry[];
  customFixedCategories: string[];
  onAddPlan: (data: {
    year: number; month: number;
    category: string; amount: number;
    type: "INCOME" | "EXPENSE" | "SAVING";
  }) => Promise<void>;
  onDeletePlan: (id: string) => Promise<void>;
}

interface CategoryBudget {
  category: string;
  group: "変動費" | "固定費" | "特別出費";
  budget: number;
  spent: number;
  planId?: string;
}

export function BudgetTab({
  year, month, totals, plans, entries, expenseByCategory,
  mergedFixedCosts, customFixedCategories, onAddPlan, onDeletePlan,
}: Props) {
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  // Build full fixed cost category set
  const allFixedCatSet = useMemo(() => {
    const s = new Set<string>(FIXED_COST_CATEGORIES);
    for (const c of customFixedCategories) s.add(c);
    return s;
  }, [customFixedCategories]);

  // Budget plans for this month (exclude ThreeStepPlan categories)
  const budgetPlans = useMemo(() => {
    return plans.filter(p => p.type === "EXPENSE" && !PLAN_CATEGORIES.has(p.category));
  }, [plans]);

  // Build per-category budget data
  const categoryBudgets: CategoryBudget[] = useMemo(() => {
    const result: CategoryBudget[] = [];
    const spentMap: Record<string, number> = {};
    for (const e of expenseByCategory) {
      spentMap[e.category] = e.amount;
    }

    // Variable expense categories
    for (const cat of LIVING_EXPENSE_CATEGORIES) {
      const plan = budgetPlans.find(p => p.category === cat);
      const spent = spentMap[cat] || 0;
      if (plan || spent > 0) {
        result.push({
          category: cat,
          group: "変動費",
          budget: plan?.amount || 0,
          spent,
          planId: plan?.id,
        });
      }
    }

    // Fixed cost categories (predefined + custom)
    const fixedCats = [...FIXED_COST_CATEGORIES, ...customFixedCategories];
    for (const cat of fixedCats) {
      const plan = budgetPlans.find(p => p.category === cat);
      const spent = spentMap[cat] || 0;
      // For fixed costs, use template totals as default budget if no plan set
      const templateTotal = mergedFixedCosts
        .filter(m => m.category === cat && m.source === "template")
        .reduce((s, m) => s + m.amount, 0);
      if (plan || spent > 0 || templateTotal > 0) {
        result.push({
          category: cat,
          group: "固定費",
          budget: plan?.amount || templateTotal,
          spent,
          planId: plan?.id,
        });
      }
    }

    // Special expense categories (only if they have spending)
    for (const e of expenseByCategory) {
      if (getExpenseGroup(e.category) === "特別出費" || e.group === "特別出費") {
        const plan = budgetPlans.find(p => p.category === e.category);
        result.push({
          category: e.category,
          group: "特別出費",
          budget: plan?.amount || 0,
          spent: e.amount,
          planId: plan?.id,
        });
      }
    }

    return result;
  }, [budgetPlans, expenseByCategory, mergedFixedCosts, customFixedCategories]);

  // Group totals
  const groupTotals = useMemo(() => {
    const groups = { "変動費": { budget: 0, spent: 0 }, "固定費": { budget: 0, spent: 0 }, "特別出費": { budget: 0, spent: 0 } };
    for (const cb of categoryBudgets) {
      groups[cb.group].budget += cb.budget;
      groups[cb.group].spent += cb.spent;
    }
    // For variable expenses, also count categories with spending but no budget entry
    groups["変動費"].spent = totals.livingExpense;
    groups["固定費"].spent = totals.fixedCost;
    groups["特別出費"].spent = totals.specialExpense;
    return groups;
  }, [categoryBudgets, totals]);

  const totalBudget = groupTotals["変動費"].budget + groupTotals["固定費"].budget + groupTotals["特別出費"].budget;
  const totalSpent = totals.expense;
  const hasBudget = totalBudget > 0;

  // Categories that have no budget set (for variable expenses only)
  const unbudgetedVarCats = useMemo((): string[] => {
    const budgeted = new Set(categoryBudgets.filter(cb => cb.group === "変動費").map(cb => cb.category));
    return [...LIVING_EXPENSE_CATEGORIES].filter(c => !budgeted.has(c));
  }, [categoryBudgets]);

  async function handleSaveBudget(category: string) {
    const amt = evaluateExpression(editAmount);
    if (!amt || saving) return;
    setSaving(true);
    try {
      await onAddPlan({
        year, month,
        category,
        amount: amt,
        type: "EXPENSE",
      });
      setEditingCat(null);
      setEditAmount("");
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkSetFromActual() {
    if (bulkSaving) return;
    setBulkSaving(true);
    try {
      // Set budgets for all variable expense categories based on current spending + 10% buffer
      for (const cat of LIVING_EXPENSE_CATEGORIES) {
        const spent = expenseByCategory.find(e => e.category === cat)?.amount;
        if (spent && spent > 0) {
          const suggestedBudget = Math.ceil(spent / 1000) * 1000; // Round up to nearest 1000
          await onAddPlan({
            year, month,
            category: cat,
            amount: suggestedBudget,
            type: "EXPENSE",
          });
        }
      }
    } finally {
      setBulkSaving(false);
    }
  }

  function startEdit(cat: string, currentBudget: number) {
    setEditingCat(cat);
    setEditAmount(currentBudget > 0 ? String(currentBudget) : "");
  }

  function renderCategoryRow(cb: CategoryBudget) {
    const isEditing = editingCat === cb.category;

    return (
      <div key={cb.category} className="py-2 border-b border-dashed last:border-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{cb.category}</span>
          {!isEditing && (
            <button
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              onClick={() => startEdit(cb.category, cb.budget)}
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="flex items-center gap-2 mb-2">
            <Input
              type="text"
              inputMode="decimal"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              placeholder="予算額"
              className="h-7 text-xs flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveBudget(cb.category);
                if (e.key === "Escape") { setEditingCat(null); setEditAmount(""); }
              }}
            />
            <Button
              size="sm" className="h-7 w-7 p-0"
              onClick={() => handleSaveBudget(cb.category)}
              disabled={saving || !evaluateExpression(editAmount)}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm" variant="ghost" className="h-7 w-7 p-0"
              onClick={() => { setEditingCat(null); setEditAmount(""); }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : null}
        {cb.budget > 0 ? (
          <BudgetProgressBar spent={cb.spent} budget={cb.budget} size="sm" />
        ) : (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>実績: {formatYen(cb.spent)}</span>
            <button
              className="text-blue-500 hover:underline"
              onClick={() => startEdit(cb.category, 0)}
            >
              予算を設定
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Total budget overview */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">今月の予算</CardTitle>
            {hasBudget && (
              <span className="text-lg font-bold">{formatYen(totalBudget)}</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasBudget ? (
            <BudgetProgressBar spent={totalSpent} budget={totalBudget} />
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                予算を設定すると、支出の管理がしやすくなります
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkSetFromActual}
                disabled={bulkSaving}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {bulkSaving ? "設定中..." : "実績から予算を自動設定"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variable expenses */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-orange-600">変動費</CardTitle>
            {groupTotals["変動費"].budget > 0 && (
              <span className="text-sm font-bold">予算 {formatYen(groupTotals["変動費"].budget)}</span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {groupTotals["変動費"].budget > 0 && (
            <div className="mb-3">
              <BudgetProgressBar
                spent={groupTotals["変動費"].spent}
                budget={groupTotals["変動費"].budget}
                size="sm"
              />
            </div>
          )}
          <div>
            {categoryBudgets
              .filter(cb => cb.group === "変動費")
              .map(cb => renderCategoryRow(cb))}
          </div>
          {/* Unbudgeted categories */}
          {unbudgetedVarCats.length > 0 && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-[10px] text-muted-foreground mb-1">未設定のカテゴリ</p>
              <div className="flex flex-wrap gap-1">
                {unbudgetedVarCats.map(cat => (
                  <Button
                    key={cat}
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs text-muted-foreground"
                    onClick={() => startEdit(cat, 0)}
                  >
                    + {cat}
                  </Button>
                ))}
              </div>
              {/* If editing an unbudgeted category, show inline form */}
              {editingCat && unbudgetedVarCats.includes(editingCat) && (
                <div className="mt-2 p-2 bg-muted/20 rounded">
                  <p className="text-xs font-medium mb-1">{editingCat}</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="予算額"
                      className="h-7 text-xs flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveBudget(editingCat);
                        if (e.key === "Escape") { setEditingCat(null); setEditAmount(""); }
                      }}
                    />
                    <Button
                      size="sm" className="h-7 w-7 p-0"
                      onClick={() => handleSaveBudget(editingCat)}
                      disabled={saving || !evaluateExpression(editAmount)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm" variant="ghost" className="h-7 w-7 p-0"
                      onClick={() => { setEditingCat(null); setEditAmount(""); }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fixed costs */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-blue-600">固定費</CardTitle>
            {groupTotals["固定費"].budget > 0 && (
              <span className="text-sm font-bold">予算 {formatYen(groupTotals["固定費"].budget)}</span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">
            テンプレート設定済みの項目は自動で予算に反映されます
          </p>
        </CardHeader>
        <CardContent>
          {groupTotals["固定費"].budget > 0 && (
            <div className="mb-3">
              <BudgetProgressBar
                spent={groupTotals["固定費"].spent}
                budget={groupTotals["固定費"].budget}
                size="sm"
              />
            </div>
          )}
          <div>
            {categoryBudgets
              .filter(cb => cb.group === "固定費")
              .map(cb => renderCategoryRow(cb))}
          </div>
        </CardContent>
      </Card>

      {/* Special expenses (only if any) */}
      {categoryBudgets.some(cb => cb.group === "特別出費") && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-purple-600">特別出費</CardTitle>
              {groupTotals["特別出費"].budget > 0 && (
                <span className="text-sm font-bold">予算 {formatYen(groupTotals["特別出費"].budget)}</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {groupTotals["特別出費"].budget > 0 && (
              <div className="mb-3">
                <BudgetProgressBar
                  spent={groupTotals["特別出費"].spent}
                  budget={groupTotals["特別出費"].budget}
                  size="sm"
                />
              </div>
            )}
            <div>
              {categoryBudgets
                .filter(cb => cb.group === "特別出費")
                .map(cb => renderCategoryRow(cb))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk set button */}
      {hasBudget && (
        <div className="text-center">
          <Button
            size="sm"
            variant="outline"
            onClick={handleBulkSetFromActual}
            disabled={bulkSaving}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            {bulkSaving ? "設定中..." : "実績から予算を再設定"}
          </Button>
        </div>
      )}
    </div>
  );
}
