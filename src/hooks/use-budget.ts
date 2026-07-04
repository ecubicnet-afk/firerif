"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getExpenseGroup, FIXED_COST_CATEGORIES, INCOME_CATEGORIES, SAVING_CATEGORIES, SIX_GRID_CELLS } from "@/lib/budget-categories";
import type { ExpenseGroup, CostType, PayMethod } from "@/lib/budget-categories";
import type { TrendPoint } from "@/components/budget/BudgetTrend";

export interface BudgetEntry {
  id: string;
  year: number;
  month: number;
  day: number;
  category: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "SAVING";
  costType: CostType | null;
  payMethod: PayMethod | null;
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

// Predefined categories that use templates (fixed costs + income + savings)
const PREDEFINED_TEMPLATE_CATEGORIES = new Set<string>([
  ...FIXED_COST_CATEGORIES,
  ...INCOME_CATEGORIES,
  ...SAVING_CATEGORIES,
]);

const PREDEFINED_FIXED_SET = new Set<string>(FIXED_COST_CATEGORIES);

export function useBudget() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [plans, setPlans] = useState<BudgetPlan[]>([]);
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
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

  const fetchTrend = useCallback(async () => {
    const res = await fetch(`/api/budget/trend?months=6&year=${year}&month=${month}`);
    const data = await res.json();
    setTrend(Array.isArray(data) ? data : []);
  }, [year, month]);

  // 先月の固定費エントリ（毎月コピー用のコピー元）を取得
  const fetchPrevMonthFixed = useCallback(async (): Promise<BudgetEntry[]> => {
    let py = year;
    let pm = month - 1;
    if (pm === 0) { pm = 12; py -= 1; }
    const res = await fetch(`/api/budget?year=${py}&month=${pm}`);
    const data = await res.json();
    return (Array.isArray(data) ? data : []).filter(
      (e: BudgetEntry) => e.type === "EXPENSE" && e.costType === "FIXED" && !!e.payMethod
    );
  }, [year, month]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEntries(), fetchPlans(), fetchTemplates(), fetchTrend()]).finally(() => setLoading(false));
  }, [fetchEntries, fetchPlans, fetchTemplates, fetchTrend]);

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
    costType?: CostType | null; payMethod?: PayMethod | null;
    memo?: string; imageData?: string | null;
  }) {
    // 楽観的更新：サーバー応答を待たず即UIに反映（体感ゼロ遅延）
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const optimistic: BudgetEntry = {
      id: tempId,
      year: data.year, month: data.month, day: data.day,
      category: data.category, amount: data.amount, type: data.type,
      costType: data.costType ?? null, payMethod: data.payMethod ?? null,
      memo: data.memo ?? null, imageData: data.imageData ?? null,
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [optimistic, ...prev]);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const saved = await res.json();
      if (saved?.id) {
        setEntries((prev) => prev.map((e) => (e.id === tempId ? { ...optimistic, ...saved } : e)));
      }
    } catch {
      setEntries((prev) => prev.filter((e) => e.id !== tempId)); // 失敗→ロールバック
    }
  }

  async function deleteEntry(id: string) {
    // 楽観的更新：即UIから消す
    const backup = entries;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    try {
      await fetch(`/api/budget/${id}`, { method: "DELETE" });
    } catch {
      setEntries(backup); // 失敗→戻す
    }
  }

  async function updateEntry(id: string, patch: { category?: string; amount?: number }) {
    const target = entries.find((e) => e.id === id);
    if (!target) return;
    const updated = { ...target, ...patch };
    // 楽観的更新：即UIに反映
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    try {
      await fetch(`/api/budget/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: updated.category,
          amount: updated.amount,
          type: updated.type,
          costType: updated.costType,
          payMethod: updated.payMethod,
          memo: updated.memo,
        }),
      });
    } catch {
      setEntries((prev) => prev.map((e) => (e.id === id ? target : e))); // ロールバック
    }
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
    id?: string;
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
  // Returns MergedEntry[] — all templates and entries for each category
  function getMergedEntries(categories: readonly string[], type: "INCOME" | "EXPENSE" | "SAVING"): MergedEntry[] {
    const result: MergedEntry[] = [];
    for (const cat of categories) {
      // Include ALL templates for this category (supports multiple per category)
      const catTemplates = templates.filter(t => t.type === type && t.category === cat);
      for (const tmpl of catTemplates) {
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
      // Also include any month-specific entries
      const monthEntries = entries.filter(e => e.type === type && e.category === cat);
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
    }
    return result;
  }

  // Find custom fixed cost categories (EXPENSE templates/entries not in any predefined set)
  const customFixedCategories = useMemo(() => {
    const customs = new Set<string>();
    for (const t of templates) {
      if (t.type === "EXPENSE" && !PREDEFINED_TEMPLATE_CATEGORIES.has(t.category)) {
        customs.add(t.category);
      }
    }
    for (const e of entries) {
      if (e.type === "EXPENSE" && !PREDEFINED_TEMPLATE_CATEGORIES.has(e.category) && !customs.has(e.category)) {
        // Only include if it looks like a custom fixed cost (has a template or is not a living/special expense)
        // Check if there's a template for it
        if (templates.some(t => t.category === e.category && t.type === "EXPENSE")) {
          customs.add(e.category);
        }
      }
    }
    return [...customs];
  }, [templates, entries]);

  // Merged entries for totals calculation
  const mergedFixedCosts = useMemo(
    () => getMergedEntries([...FIXED_COST_CATEGORIES, ...customFixedCategories], "EXPENSE"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, templates, customFixedCategories]
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
    // Build dynamic template categories set (predefined + custom)
    const templateCats = new Set<string>(PREDEFINED_TEMPLATE_CATEGORIES);
    for (const c of customFixedCategories) templateCats.add(c);
    // Start with entries that are NOT template-category types (living expenses, special expenses)
    const nonTemplateEntries = entries.filter(e => !templateCats.has(e.category));
    // Add merged template entries as pseudo-entries
    const templateBased: BudgetEntry[] = [
      ...mergedFixedCosts.map(m => ({
        id: m.entryId || m.templateId || "",
        year, month, day: m.day,
        category: m.category, amount: m.amount,
        type: "EXPENSE" as const,
        costType: null, payMethod: null,
        memo: m.memo, imageData: null, createdAt: "",
      })),
      ...mergedIncome.map(m => ({
        id: m.entryId || m.templateId || "",
        year, month, day: m.day,
        category: m.category, amount: m.amount,
        type: "INCOME" as const,
        costType: null, payMethod: null,
        memo: m.memo, imageData: null, createdAt: "",
      })),
      ...mergedSavings.map(m => ({
        id: m.entryId || m.templateId || "",
        year, month, day: m.day,
        category: m.category, amount: m.amount,
        type: "SAVING" as const,
        costType: null, payMethod: null,
        memo: m.memo, imageData: null, createdAt: "",
      })),
    ];
    return [...nonTemplateEntries, ...templateBased];
  }, [entries, mergedFixedCosts, mergedIncome, mergedSavings, year, month, customFixedCategories]);

  // Totals - now includes template values
  // Build a set of all fixed cost categories (predefined + custom) for classification
  const allFixedCatSet = useMemo(() => {
    const s = new Set<string>(FIXED_COST_CATEGORIES);
    for (const c of customFixedCategories) s.add(c);
    return s;
  }, [customFixedCategories]);

  const totals = useMemo(() => {
    const all = allEffectiveEntries;
    const income = all.filter(e => e.type === "INCOME").reduce((s, e) => s + e.amount, 0);
    const expense = all.filter(e => e.type === "EXPENSE").reduce((s, e) => s + e.amount, 0);
    const saving = all.filter(e => e.type === "SAVING").reduce((s, e) => s + e.amount, 0);

    const fixedCost = all
      .filter(e => e.type === "EXPENSE" && allFixedCatSet.has(e.category))
      .reduce((s, e) => s + e.amount, 0);
    const specialExpense = all
      .filter(e => e.type === "EXPENSE" && getExpenseGroup(e.category) === "特別出費")
      .reduce((s, e) => s + e.amount, 0);
    const livingExpense = expense - fixedCost - specialExpense;

    const baseExpense = livingExpense + fixedCost;
    const salary = all.filter(e => e.type === "INCOME" && e.category === "給与").reduce((s, e) => s + e.amount, 0);
    const baseBalance = salary - baseExpense;

    return {
      income, expense, saving,
      livingExpense, fixedCost, specialExpense,
      baseExpense, salary, baseBalance,
      balance: income - expense - saving,
    };
  }, [allEffectiveEntries, allFixedCatSet]);

  // Expense by category - includes template values
  const expenseByCategory = useMemo(() => {
    const map: Record<string, { amount: number; group: ExpenseGroup }> = {};
    allEffectiveEntries.filter(e => e.type === "EXPENSE").forEach(e => {
      if (!map[e.category]) {
        const group = allFixedCatSet.has(e.category) ? "固定費" : getExpenseGroup(e.category);
        map[e.category] = { amount: 0, group };
      }
      map[e.category].amount += e.amount;
    });
    return Object.entries(map)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }, [allEffectiveEntries, allFixedCatSet]);

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

  // ============================================================
  // 6枠家計簿の集計（月末1回入力モデル）
  // costType + payMethod を持つ EXPENSE エントリのみが対象
  // ============================================================
  const sixGridEntries = useMemo(
    () => entries.filter(e => e.type === "EXPENSE" && e.costType && e.payMethod),
    [entries]
  );

  // 6枠それぞれの合計（① 固定×クレカ 〜 ⑥ 変動×現金）
  const gridTotals = useMemo(() => {
    return SIX_GRID_CELLS.map(cell => {
      const cellEntries = sixGridEntries.filter(
        e => e.costType === cell.costType && e.payMethod === cell.payMethod
      );
      const amount = cellEntries.reduce((s, e) => s + e.amount, 0);
      return { ...cell, amount, entries: cellEntries };
    });
  }, [sixGridEntries]);

  // 固定費合計 / 変動費合計 / 支出合計
  const sixGridSummary = useMemo(() => {
    const fixedTotal = sixGridEntries
      .filter(e => e.costType === "FIXED")
      .reduce((s, e) => s + e.amount, 0);
    const variableTotal = sixGridEntries
      .filter(e => e.costType === "VARIABLE")
      .reduce((s, e) => s + e.amount, 0);
    return { fixedTotal, variableTotal, expenseTotal: fixedTotal + variableTotal };
  }, [sixGridEntries]);

  // 固定費ランキング（削減候補・カテゴリ別 TOP）
  const fixedRanking = useMemo(() => {
    const map: Record<string, number> = {};
    sixGridEntries
      .filter(e => e.costType === "FIXED")
      .forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [sixGridEntries]);

  // 前月比（6マス支出合計の差分・マイナス=減った）
  const monthOverMonth = useMemo(() => {
    if (trend.length < 2) return null;
    const prev = trend[trend.length - 2];
    // 当月はローカル即時集計(sixGridSummary)を使う＝追加のたびに前月比も即更新・trend再取得不要
    return {
      prevTotal: prev.expenseTotal,
      diff: sixGridSummary.expenseTotal - prev.expenseTotal,
      prevFixed: prev.fixedTotal,
      fixedDiff: sixGridSummary.fixedTotal - prev.fixedTotal,
    };
  }, [trend, sixGridSummary.expenseTotal, sixGridSummary.fixedTotal]);

  return {
    year, month, prevMonth, nextMonth,
    entries, plans, templates, loading,
    addEntry, deleteEntry, updateEntry, addPlan, deletePlan,
    addTemplate, deleteTemplate,
    fetchEntries, fetchPlans, fetchTemplates, fetchTrend, fetchPrevMonthFixed,
    getMergedEntries,
    mergedFixedCosts, mergedIncome, mergedSavings, customFixedCategories,
    totals, expenseByCategory, weeklyGroups,
    // 6枠家計簿
    sixGridEntries, gridTotals, sixGridSummary, fixedRanking,
    trend, monthOverMonth,
  };
}
