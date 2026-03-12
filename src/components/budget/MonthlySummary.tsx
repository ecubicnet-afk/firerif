"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatYen } from "@/lib/utils";
import { EXPENSE_GROUP_CONFIG } from "@/lib/budget-categories";
import type { ExpenseGroup } from "@/lib/budget-categories";

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
}

const EXPENSE_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6",
  "#a855f7", "#6366f1", "#84cc16",
];

export function MonthlySummary({ totals, expenseByCategory }: Props) {
  return (
    <div className="space-y-4">
      {/* Summary cards - notebook style */}
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

      {/* Expense breakdown by group - notebook style */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">支出の内訳</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Three-group summary */}
          <div className="grid grid-cols-3 gap-2">
            {(["生活費", "固定費", "特別出費"] as const).map((group) => {
              const cfg = EXPENSE_GROUP_CONFIG[group];
              const amount = group === "生活費" ? totals.livingExpense
                : group === "固定費" ? totals.fixedCost : totals.specialExpense;
              return (
                <div key={group} className="text-center p-2 rounded-lg bg-muted/50">
                  <p className="text-[10px] text-muted-foreground">{cfg.label}</p>
                  <p className={`text-sm font-bold ${cfg.color}`}>{formatYen(amount)}</p>
                </div>
              );
            })}
          </div>

          {/* Category bar chart */}
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
    </div>
  );
}
