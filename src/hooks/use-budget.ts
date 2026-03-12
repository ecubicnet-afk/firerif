"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getExpenseGroup, FIXED_COST_CATEGORIES, INCOME_CATEGORIES, SAVING_CATEGORIES } from "@/lib/budget-categories";
import type { ExpenseGroup } from "@/lib/budget-categories";

export interface BudgetEntry {
  id: string;
  year: number;
  month: number;
  day: number;
  category: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "SAVING";
  memo: string | null;
  imageData: string | null;
  createdAt: string;
}

export interface BudgetPlan {
  id: string;
  category: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "SAVING";
}

export interface BudgetTemplate {
  id: string;
  category: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "SAVING";
  day: number;
  memo: string | null;
  endDate: string | null;
}

// A merged view: either from a real entry or from a template
export interface MergedEntry {
  category: string;
  amount: number;
  day: number;
  memo: string | null;
  source: "template" | "entry";
  entryId?: string;
  templateId?: string;
  endDate?: string | null;
}

// Categories that use templates (fixed costs + income + savings)
const TEMPLATE_CATEGORIES = new Set<string>([
  ...FIXED_COST_CATEGORIES,
  ...INCOME_CATEGORIES,
  ...SAVING_CATEGORIES,
]);

export function useBudget() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [plans, setPlans] = useState<BudgetPlan[]>([]);
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/budget?year=${year}&month=${month}`);
    const data = await res.json();
    setEntries(Array.isArray(data) ? data : []);
  }, [year, month]);

  const fetchPlans = useCallback(async () => {
    const res = await fetch(`/api/budget/plan?year=${year}&month=${month}`);
    const data = await res.json();
    setPlans(Array.isArray(data) ? data : []);
  }, [year, month]);

  const fetchTemplates = useCallback(async () => {
    const res = await fetch("/api/budget/template");
    const data = await res.json();
    setTemplates(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEntries(), fetchPlans(), fetchTemplates()]).finally(() => setLoading(false));
  }, [fetchEntries, fetchPlans, fetchTemplates]);

  function prevMonth() {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  }

  function nextMonth() {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  }

  async function addEntry(data: {
    year: number; month: number; day: number;
    category: string; amount: number;
    type: "INCOME" | "EXPENSE" | "SAVING";
    memo?: string; imageData?: string | null;
  }) {
    await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchEntries();
  }

  async function deleteEntry(id: string) {
    await fetch(`/api/budget/${id}`, { method: "DELETE" });
    await fetchEntries();
  }

  async function addPlan(data: {
    year: number; month: number;
    category: string; amount: number;
    type: "INCOME" | "EXPENSE" | "SAVING";
  }) {
    await fetch("/api/budget/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchPlans();
  }

  async function deletePlan(id: string) {
    await fetch(`/api/budget/plan?id=${id}`, { method: "DELETE" });
    await fetchPlans();
  }

  async function addTemplate(data: {
    category: string; amount: number;
    type: "INCOME" | "EXPENSE" | "SAVING";
    day?: number; memo?: string; endDate?: string | null;
  }) {
    await fetch("/api/budget/template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await fetchTemplates();
  }

  async function deleteTemplate(id: string) {
    await fetch(`/api/budget/template?id=${id}`, { method: "DELETE" });
    await fetchTemplates();
  }

  // Merge templates with entries for a given set of categories and type
  // Returns MergedEntry[] for each category
  function getMergedEntries(categories: readonly string[], type: "INCOME" | "EXPENSE" | "SAVING"): MergedEntry[] {
    const result: MergedEntry[] = [];
    for (const cat of categories) {
      // Check if there are actual entries for this month+category
      const monthEntries = entries.filter(e => e.type === type && e.category === cat);
      if (monthEntries.length > 0) {
        // Use actual entries (override)
        for (const e of monthEntries) {
          result.push({
            category: e.category,
            amount: e.amount,
            day: e.day,
            memo: e.memo,
            source: "entry",
            entryId: e.id,
          });
        }
      } else {
        // Check for template
        const tmpl = templates.find(t => t.type === type && t.category === cat);
        if (tmpl) {
          result.push({
            category: tmpl.category,
            amount: tmpl.amount,
            day: tmpl.day,
            memo: tmpl.memo,
            source: "template",
            templateId: tmpl.id,
            endDate: tmpl.endDate,
          });
        }
      }
    }
    return result;
  }

  // Merged entries for totals calculation
  const mergedFixedCosts = useMemo(
    () => getMergedEntries(FIXED_COST_CATEGORIES, "EXPENSE"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, templates]
  );
  const mergedIncome = useMemo(
    () => getMergedEntries(INCOME_CATEGORIES, "INCOME"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, templates]
  );
  const mergedSavings = useMemo(
    () => getMergedEntries(SAVING_CATEGORIES, "SAVING"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, templates]
  );

  // All entries including template-sourced ones (for totals)
  const allEffectiveEntries = useMemo(() => {
    // Start with entries that are NOT template-category types (living expenses, special expenses)
    const nonTemplateEntries = entries.filter(e => !TEMPLATE_CATEGORIES.has(e.category));
    // Add merged template entries as pseudo-entries
    const templateBased: BudgetEntry[] = [
      ...mergedFixedCosts.map(m => ({
        id: m.entryId || m.templateId || "",
        year, month, day: m.day,
        category: m.category, amount: m.amount,
        type: "EXPENSE" as const,
        memo: m.memo, imageData: null, createdAt: "",
      })),
      ...mergedIncome.map(m => ({
        id: m.entryId || m.templateId || "",
        year, month, day: m.day,
        category: m.category, amount: m.amount,
        type: "INCOME" as const,
        memo: m.memo, imageData: null, createdAt: "",
      })),
      ...mergedSavings.map(m => ({
        id: m.entryId || m.templateId || "",
        year, month, day: m.day,
        category: m.category, amount: m.amount,
        type: "SAVING" as const,
        memo: m.memo, imageData: null, createdAt: "",
      })),
    ];
    return [...nonTemplateEntries, ...templateBased];
  }, [entries, mergedFixedCosts, mergedIncome, mergedSavings, year, month]);

  // Totals - now includes template values
  const totals = useMemo(() => {
    const all = allEffectiveEntries;
    const income = all.filter(e => e.type === "INCOME").reduce((s, e) => s + e.amount, 0);
    const expense = all.filter(e => e.type === "EXPENSE").reduce((s, e) => s + e.amount, 0);
    const saving = all.filter(e => e.type === "SAVING").reduce((s, e) => s + e.amount, 0);

    const livingExpense = all
      .filter(e => e.type === "EXPENSE" && getExpenseGroup(e.category) === "生活費")
      .reduce((s, e) => s + e.amount, 0);
    const fixedCost = all
      .filter(e => e.type === "EXPENSE" && getExpenseGroup(e.category) === "固定費")
      .reduce((s, e) => s + e.amount, 0);
    const specialExpense = all
      .filter(e => e.type === "EXPENSE" && getExpenseGroup(e.category) === "特別出費")
      .reduce((s, e) => s + e.amount, 0);

    const baseExpense = livingExpense + fixedCost;
    const salary = all.filter(e => e.type === "INCOME" && e.category === "給与").reduce((s, e) => s + e.amount, 0);
    const baseBalance = salary - baseExpense;

    return {
      income, expense, saving,
      livingExpense, fixedCost, specialExpense,
      baseExpense, salary, baseBalance,
      balance: income - expense - saving,
    };
  }, [allEffectiveEntries]);

  // Expense by category - includes template values
  const expenseByCategory = useMemo(() => {
    const map: Record<string, { amount: number; group: ExpenseGroup }> = {};
    allEffectiveEntries.filter(e => e.type === "EXPENSE").forEach(e => {
      if (!map[e.category]) {
        map[e.category] = { amount: 0, group: getExpenseGroup(e.category) };
      }
      map[e.category].amount += e.amount;
    });
    return Object.entries(map)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }, [allEffectiveEntries]);

  // Weekly grid data - only uses actual entries (not templates)
  const weeklyGroups = useMemo(() => {
    if (entries.length === 0 && mergedFixedCosts.length === 0) return [];
    const allForGrid = allEffectiveEntries;
    const groups: { label: string; startDay: Date; endDay: Date; entries: BudgetEntry[] }[] = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const ws = new Date(firstDay);
    const dayOfWeek = ws.getDay();
    if (dayOfWeek !== 1) {
      ws.setDate(ws.getDate() - ((dayOfWeek + 6) % 7));
    }
    while (ws <= lastDay) {
      const weekEnd = new Date(ws);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const wEntries = allForGrid.filter(e => {
        const d = new Date(e.year, e.month - 1, e.day || 1);
        return d >= ws && d <= weekEnd;
      });
      const label = `${ws.getMonth() + 1}/${ws.getDate()} 〜 ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
      groups.push({ label, startDay: new Date(ws), endDay: new Date(weekEnd), entries: wEntries });
      ws.setDate(ws.getDate() + 7);
    }
    return groups;
  }, [allEffectiveEntries, year, month, entries, mergedFixedCosts]);

  return {
    year, month, prevMonth, nextMonth,
    entries, plans, templates, loading,
    addEntry, deleteEntry, addPlan, deletePlan,
    addTemplate, deleteTemplate,
    fetchEntries, fetchPlans, fetchTemplates,
    getMergedEntries,
    mergedFixedCosts, mergedIncome, mergedSavings,
    totals, expenseByCategory, weeklyGroups,
  };
}
