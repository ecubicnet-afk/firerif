"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getExpenseGroup } from "@/lib/budget-categories";
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

export function useBudget() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [plans, setPlans] = useState<BudgetPlan[]>([]);
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

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEntries(), fetchPlans()]).finally(() => setLoading(false));
  }, [fetchEntries, fetchPlans]);

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

  // Totals
  const totals = useMemo(() => {
    const income = entries.filter(e => e.type === "INCOME").reduce((s, e) => s + e.amount, 0);
    const expense = entries.filter(e => e.type === "EXPENSE").reduce((s, e) => s + e.amount, 0);
    const saving = entries.filter(e => e.type === "SAVING").reduce((s, e) => s + e.amount, 0);

    // Group expenses
    const livingExpense = entries
      .filter(e => e.type === "EXPENSE" && getExpenseGroup(e.category) === "生活費")
      .reduce((s, e) => s + e.amount, 0);
    const fixedCost = entries
      .filter(e => e.type === "EXPENSE" && getExpenseGroup(e.category) === "固定費")
      .reduce((s, e) => s + e.amount, 0);
    const specialExpense = entries
      .filter(e => e.type === "EXPENSE" && getExpenseGroup(e.category) === "特別出費")
      .reduce((s, e) => s + e.amount, 0);

    const baseExpense = livingExpense + fixedCost;
    const salary = entries.filter(e => e.type === "INCOME" && e.category === "給与").reduce((s, e) => s + e.amount, 0);
    const baseBalance = salary - baseExpense;

    return {
      income, expense, saving,
      livingExpense, fixedCost, specialExpense,
      baseExpense, salary, baseBalance,
      balance: income - expense - saving,
    };
  }, [entries]);

  // Expense by category
  const expenseByCategory = useMemo(() => {
    const map: Record<string, { amount: number; group: ExpenseGroup }> = {};
    entries.filter(e => e.type === "EXPENSE").forEach(e => {
      if (!map[e.category]) {
        map[e.category] = { amount: 0, group: getExpenseGroup(e.category) };
      }
      map[e.category].amount += e.amount;
    });
    return Object.entries(map)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }, [entries]);

  // Weekly grid data: { weekLabel, days: { day, entries, dayTotal }[], weekTotal }
  const weeklyGroups = useMemo(() => {
    if (entries.length === 0) return [];
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
      const wEntries = entries.filter(e => {
        const d = new Date(e.year, e.month - 1, e.day || 1);
        return d >= ws && d <= weekEnd;
      });
      const label = `${ws.getMonth() + 1}/${ws.getDate()} 〜 ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
      groups.push({ label, startDay: new Date(ws), endDay: new Date(weekEnd), entries: wEntries });
      ws.setDate(ws.getDate() + 7);
    }
    return groups;
  }, [entries, year, month]);

  return {
    year, month, prevMonth, nextMonth,
    entries, plans, loading,
    addEntry, deleteEntry, addPlan, deletePlan,
    fetchEntries, fetchPlans,
    totals, expenseByCategory, weeklyGroups,
  };
}
