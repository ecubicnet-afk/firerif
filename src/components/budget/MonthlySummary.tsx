"use client";

import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatYen } from "@/lib/utils";
import { evaluateExpression, isExpressionString } from "@/lib/budget-utils";
import {
  EXPENSE_GROUP_CONFIG,
  LIVING_EXPENSE_CATEGORIES,
  FIXED_COST_CATEGORIES,
  SPECIAL_EXPENSE_CATEGORIES,
} from "@/lib/budget-categories";
import type { ExpenseGroup } from "@/lib/budget-categories";
import type { BudgetEntry } from "@/hooks/use-budget";
import { ImageIcon, X, ChevronDown, Trash2, Check } from "lucide-react";

type ExpenseSubGroup = "変動費" | "固定費" | "特別出費";

const EXPENSE_SUBGROUPS: { key: ExpenseSubGroup; cats: readonly string[] }[] = [
  { key: "変動費", cats: LIVING_EXPENSE_CATEGORIES },
  { key: "固定費", cats: FIXED_COST_CATEGORIES },
  { key: "特別出費", cats: SPECIAL_EXPENSE_CATEGORIES },
];

interface Props {
  totals: {
    income: number;
    expense: number;
    saving: number;
    livingExpense: number;
    fixedCost: number;
    specialExpense: number;
    balance: number;
  };
  expenseByCategory: { category: string; amount: number; group: ExpenseGroup }[];
  year: number;
  month: number;
  entries: BudgetEntry[];
  onAddEntry: (data: {
    year: number; month: number; day: number;
    category: string; amount: number;
    type: "INCOME" | "EXPENSE" | "SAVING";
    memo?: string;
    imageData?: string | null;
  }) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

const EXPENSE_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6",
  "#a855f7", "#6366f1", "#84cc16",
];

// evaluateExpression imported from @/lib/budget-utils

export function MonthlySummary({ totals, expenseByCategory, year, month, entries, onAddEntry, onDeleteEntry }: Props) {
  // Form state
  const [subGroup, setSubGroup] = useState<ExpenseSubGroup>("変動費");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAllRecords, setShowAllRecords] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const today = new Date();
  const [formDate, setFormDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );

  // Current categories based on subgroup
  const currentCats = EXPENSE_SUBGROUPS.find(g => g.key === subGroup)?.cats || [];

  // Evaluate amount expression for preview
  const evaluatedAmount = evaluateExpression(amount);
  const isExpression = isExpressionString(amount);

  // Recent expense entries (descending by day, then by createdAt)
  const recentExpenses = useMemo(() => {
    return entries
      .filter(e => e.type === "EXPENSE")
      .sort((a, b) => {
        if (b.day !== a.day) return b.day - a.day;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [entries]);

  const displayedRecords = showAllRecords ? recentExpenses : recentExpenses.slice(0, 10);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("画像は2MB以下にしてください"); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    // Validation
    if (!category) {
      setError("カテゴリを選択してください");
      return;
    }
    if (!amount) {
      setError("金額を入力してください");
      return;
    }
    const parsedAmount = evaluateExpression(amount);
    if (parsedAmount === null || parsedAmount <= 0) {
      setError("正しい金額を入力してください");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const parts = formDate.split("-").map(Number);
      await onAddEntry({
        year: parts[0], month: parts[1], day: parts[2],
        category,
        amount: parsedAmount,
        type: "EXPENSE",
        memo: memo || undefined,
        imageData: image,
      });
      // Reset form
      setCategory("");
      setAmount("");
      setMemo("");
      setImage(null);
      // Show saved feedback
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 1500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">総収入</p>
            <p className="text-lg font-bold text-green-600">{formatYen(totals.income)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">総支出</p>
            <p className="text-lg font-bold text-red-600">{formatYen(totals.expense)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">貯蓄</p>
            <p className="text-lg font-bold text-blue-600">{formatYen(totals.saving)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">収支</p>
            <p className={`text-lg font-bold ${totals.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatYen(totals.balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expense breakdown by group */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">支出の内訳</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {(["変動費", "固定費", "特別出費"] as const).map((group) => {
              const cfg = EXPENSE_GROUP_CONFIG[group];
              const groupAmount = group === "変動費" ? totals.livingExpense
                : group === "固定費" ? totals.fixedCost : totals.specialExpense;
              return (
                <div key={group} className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
                  <p className={`text-sm font-bold ${cfg.color}`}>{formatYen(groupAmount)}</p>
                </div>
              );
            })}
          </div>

          {expenseByCategory.length > 0 && (
            <>
              <div className="flex h-5 rounded-full overflow-hidden">
                {expenseByCategory.map((cat, i) => {
                  const pct = totals.expense > 0 ? (cat.amount / totals.expense) * 100 : 0;
                  return (
                    <div
                      key={cat.category}
                      className="h-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}
                      title={`${cat.category}: ${formatYen(cat.amount)}`}
                    />
                  );
                })}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
                {expenseByCategory.map((cat, i) => {
                  const pct = totals.expense > 0 ? Math.round((cat.amount / totals.expense) * 100) : 0;
                  return (
                    <div key={cat.category} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}
                      />
                      <span className="truncate">{cat.category}</span>
                      <span className="ml-auto font-bold whitespace-nowrap">{formatYen(cat.amount)}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Inline expense entry form */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">支出を記録</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Sub-group selector */}
            <div className="flex gap-1">
              {EXPENSE_SUBGROUPS.map(g => (
                <Badge
                  key={g.key}
                  variant={subGroup === g.key ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => { setSubGroup(g.key); setCategory(""); setError(null); }}
                >
                  {g.key}
                </Badge>
              ))}
            </div>

            {/* Category buttons */}
            <div className="flex flex-wrap gap-1.5">
              {currentCats.map(cat => (
                <Button key={cat} type="button" size="sm"
                  variant={category === cat ? "default" : "outline"}
                  className="text-xs h-7"
                  onClick={() => { setCategory(cat); setError(null); }}>
                  {cat}
                </Button>
              ))}
            </div>

            {/* Date + Amount */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px]">日付</Label>
                <Input type="date" value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px]">金額（円）</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError(null); }}
                  className="h-8 text-xs"
                />
                {isExpression && evaluatedAmount !== null && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    = {evaluatedAmount.toLocaleString()}円
                  </p>
                )}
              </div>
            </div>

            {/* Memo + Image */}
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <Label className="text-[10px]">メモ</Label>
                <Input placeholder="任意" value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="h-8 text-xs" />
              </div>
              <div className="pt-4">
                <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border hover:bg-accent transition-colors">
                  <ImageIcon className="h-3.5 w-3.5" />
                  画像
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
            </div>

            {/* Image preview */}
            {image && (
              <div className="relative inline-block">
                <img src={image} alt="" className="h-16 w-16 object-cover rounded" />
                <button type="button" onClick={() => setImage(null)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Error message */}
            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className={`w-full transition-colors ${saved ? "bg-green-600 hover:bg-green-600" : ""}`}
              disabled={saving}
            >
              {saving ? "保存中..." : saved ? (
                <span className="flex items-center gap-1"><Check className="h-4 w-4" /> 保存しました</span>
              ) : "保存する"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent expense records */}
      {recentExpenses.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">最近の記録</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {displayedRecords.map(entry => (
              <div key={entry.id} className="flex items-center gap-2 py-1.5 border-b last:border-0 text-xs">
                <span className="text-muted-foreground shrink-0 w-10">
                  {month}/{entry.day}
                </span>
                <span className="font-medium shrink-0">{entry.category}</span>
                <span className="font-bold text-red-600 shrink-0">{formatYen(entry.amount)}</span>
                {entry.memo && (
                  <span className="text-muted-foreground truncate">{entry.memo}</span>
                )}
                {entry.imageData && (
                  <img src={entry.imageData} alt="" className="h-6 w-6 object-cover rounded shrink-0" />
                )}
                <button
                  type="button"
                  onClick={() => onDeleteEntry(entry.id)}
                  className="ml-auto shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {recentExpenses.length > 10 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs mt-1"
                onClick={() => setShowAllRecords(!showAllRecords)}
              >
                <ChevronDown className={`h-3.5 w-3.5 mr-1 transition-transform ${showAllRecords ? "rotate-180" : ""}`} />
                {showAllRecords ? "閉じる" : `すべて表示（${recentExpenses.length}件）`}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
