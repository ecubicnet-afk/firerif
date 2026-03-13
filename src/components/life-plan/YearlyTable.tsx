"use client";

import type { YearlyProjection } from "@/types/life-plan";

interface Props {
  projections: YearlyProjection[];
}

export function YearlyTable({ projections }: Props) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-bold mb-2">年次収支表</h3>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto border rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-2 py-1.5 text-left font-bold">年齢</th>
              <th className="px-2 py-1.5 text-right font-bold">収入</th>
              <th className="px-2 py-1.5 text-right font-bold">生活費</th>
              <th className="px-2 py-1.5 text-right font-bold">住居費</th>
              <th className="px-2 py-1.5 text-right font-bold">教育費</th>
              <th className="px-2 py-1.5 text-right font-bold">イベント</th>
              <th className="px-2 py-1.5 text-right font-bold">運用益</th>
              <th className="px-2 py-1.5 text-right font-bold">年間収支</th>
              <th className="px-2 py-1.5 text-right font-bold">累計資産</th>
              <th className="px-2 py-1.5 text-left font-bold">備考</th>
            </tr>
          </thead>
          <tbody>
            {projections.map((p) => (
              <tr
                key={p.age}
                className={`border-t ${
                  p.milestones.length > 0 ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                } ${p.netWorth < 0 ? "bg-rose-50/50 dark:bg-rose-900/10" : ""}`}
              >
                <td className="px-2 py-1 font-bold">{p.age}歳</td>
                <td className="px-2 py-1 text-right">{p.income.toLocaleString()}</td>
                <td className="px-2 py-1 text-right">{p.expense.toLocaleString()}</td>
                <td className="px-2 py-1 text-right">{p.housingCost.toLocaleString()}</td>
                <td className="px-2 py-1 text-right">
                  {p.educationCost > 0 ? p.educationCost.toLocaleString() : "-"}
                </td>
                <td className="px-2 py-1 text-right">
                  {p.eventCost > 0 ? p.eventCost.toLocaleString() : "-"}
                </td>
                <td className="px-2 py-1 text-right text-emerald-600">
                  {p.investmentReturn > 0 ? `+${p.investmentReturn.toLocaleString()}` : "-"}
                </td>
                <td
                  className={`px-2 py-1 text-right font-bold ${
                    p.cashFlow >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {p.cashFlow >= 0 ? "+" : ""}
                  {p.cashFlow.toLocaleString()}
                </td>
                <td
                  className={`px-2 py-1 text-right font-bold ${
                    p.netWorth >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {p.netWorth.toLocaleString()}
                </td>
                <td className="px-2 py-1 text-blue-600 max-w-[120px] truncate">
                  {p.milestones.join("、")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-2 max-h-[400px] overflow-y-auto">
        {projections
          .filter((p, i) => i % 5 === 0 || p.milestones.length > 0)
          .map((p) => (
            <div
              key={p.age}
              className={`rounded-lg border p-3 text-xs ${
                p.netWorth < 0 ? "border-rose-200 dark:border-rose-800" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">{p.age}歳</span>
                <span
                  className={`font-bold ${
                    p.netWorth >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  資産 {p.netWorth.toLocaleString()}万円
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 text-muted-foreground">
                <span>収入: {p.income.toLocaleString()}</span>
                <span>生活費: {p.expense.toLocaleString()}</span>
                <span>住居費: {p.housingCost.toLocaleString()}</span>
                <span
                  className={
                    p.cashFlow >= 0 ? "text-emerald-600" : "text-rose-600"
                  }
                >
                  収支: {p.cashFlow >= 0 ? "+" : ""}
                  {p.cashFlow.toLocaleString()}
                </span>
              </div>
              {p.milestones.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {p.milestones.map((m, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px]"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
