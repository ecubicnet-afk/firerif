"use client";

import { useState } from "react";
import { useBudget } from "@/hooks/use-budget";
import { MonthSelector } from "@/components/budget/MonthSelector";
import { MonthlySummary } from "@/components/budget/MonthlySummary";
import { WeeklyGrid } from "@/components/budget/WeeklyGrid";
import { FixedCosts } from "@/components/budget/FixedCosts";
import { SpecialExpenses } from "@/components/budget/SpecialExpenses";
import { IncomeAndSavings } from "@/components/budget/IncomeAndSavings";
import { ThreeStepPlan } from "@/components/budget/ThreeStepPlan";
import { QuickEntry } from "@/components/budget/QuickEntry";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, Loader2 } from "lucide-react";

type Tab = "overview" | "weekly" | "fixed" | "income" | "plan";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "概要" },
  { key: "weekly", label: "週間記録" },
  { key: "fixed", label: "固定費" },
  { key: "income", label: "収入・貯蓄" },
  { key: "plan", label: "計画" },
];

export default function BudgetPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [showEntry, setShowEntry] = useState(false);

  const {
    year, month, prevMonth, nextMonth,
    entries, plans, loading,
    addEntry, deleteEntry, addPlan,
    addTemplate, deleteTemplate,
    mergedFixedCosts, mergedIncome, mergedSavings,
    totals, expenseByCategory, weeklyGroups,
  } = useBudget();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-600" />
          <h1 className="text-2xl font-bold">家計ノート</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          つけるだけで「節約力」がアップする
        </p>
      </div>

      {/* Month selector */}
      <MonthSelector year={year} month={month} onPrev={prevMonth} onNext={nextMonth} />

      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "outline"}
            size="sm"
            className="text-xs shrink-0"
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <MonthlySummary
          totals={totals}
          expenseByCategory={expenseByCategory}
          year={year}
          month={month}
          entries={entries}
          onAddEntry={addEntry}
          onDeleteEntry={deleteEntry}
        />
      )}

      {tab === "weekly" && (
        <div className="space-y-4">
          <WeeklyGrid
            year={year}
            month={month}
            weeklyGroups={weeklyGroups}
          />
          <SpecialExpenses
            year={year}
            month={month}
            entries={entries}
            onAddEntry={addEntry}
            onDeleteEntry={deleteEntry}
          />
        </div>
      )}

      {tab === "fixed" && (
        <FixedCosts
          year={year}
          month={month}
          mergedEntries={mergedFixedCosts}
          onAddEntry={addEntry}
          onDeleteEntry={deleteEntry}
          onAddTemplate={addTemplate}
          onDeleteTemplate={deleteTemplate}
        />
      )}

      {tab === "income" && (
        <IncomeAndSavings
          year={year}
          month={month}
          mergedIncome={mergedIncome}
          mergedSavings={mergedSavings}
          onAddEntry={addEntry}
          onDeleteEntry={deleteEntry}
          onAddTemplate={addTemplate}
          onDeleteTemplate={deleteTemplate}
        />
      )}

      {tab === "plan" && (
        <ThreeStepPlan
          year={year}
          month={month}
          totals={totals}
          plans={plans}
          onAddPlan={addPlan}
        />
      )}

      {/* FAB - Quick entry button */}
      {!showEntry && (
        <button
          onClick={() => setShowEntry(true)}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-8 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      {/* Quick entry modal */}
      {showEntry && (
        <QuickEntry
          year={year}
          month={month}
          onAddEntry={addEntry}
          onClose={() => setShowEntry(false)}
        />
      )}
    </div>
  );
}
