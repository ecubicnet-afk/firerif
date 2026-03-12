"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatYen } from "@/lib/utils";
import { LIVING_EXPENSE_CATEGORIES, getExpenseGroup } from "@/lib/budget-categories";
import type { BudgetEntry } from "@/hooks/use-budget";
import { X } from "lucide-react";

interface WeekGroup {
  label: string;
  startDay: Date;
  endDay: Date;
  entries: BudgetEntry[];
}

interface Props {
  year: number;
  month: number;
  weeklyGroups: WeekGroup[];
}

// Short labels for mobile
const SHORT_LABELS: Record<string, string> = {
  "食費": "食費",
  "日用品": "日用",
  "衣服・美容費": "衣美",
  "趣味・娯楽": "娯楽",
  "交通費": "交通",
  "教育費": "教育",
  "医療費": "医療",
  "交際費": "交際",
  "こづかい": "小遣",
  "その他": "他",
};

const DAYS_JP = ["日", "月", "火", "水", "木", "金", "土"];

export function WeeklyGrid({ year, month, weeklyGroups }: Props) {
  const [selectedCell, setSelectedCell] = useState<{ day: number; category: string } | null>(null);

  // Get categories that have data or are commonly used
  const activeCats = LIVING_EXPENSE_CATEGORIES.slice(0, 8); // Show first 8 for width

  function handleCellClick(day: number, category: string, hasData: boolean) {
    if (!hasData) return;
    // Toggle: click same cell again to close
    if (selectedCell?.day === day && selectedCell?.category === category) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ day, category });
    }
  }

  return (
    <div className="space-y-4">
      {weeklyGroups.map((week, wi) => {
        // Generate days for this week
        const days: { date: Date; day: number; inMonth: boolean }[] = [];
        const d = new Date(week.startDay);
        for (let i = 0; i < 7; i++) {
          const dd = new Date(d);
          days.push({
            date: dd,
            day: dd.getDate(),
            inMonth: dd.getMonth() + 1 === month,
          });
          d.setDate(d.getDate() + 1);
        }

        // Build data grid: for each day, sum by category
        const dayData: Record<number, Record<string, number>> = {};
        const catTotals: Record<string, number> = {};
        let weekTotal = 0;

        // Only count living expenses in the grid
        const livingEntries = week.entries.filter(
          e => e.type === "EXPENSE" && getExpenseGroup(e.category) === "変動費"
        );

        for (const entry of livingEntries) {
          const key = entry.day || 1;
          if (!dayData[key]) dayData[key] = {};
          dayData[key][entry.category] = (dayData[key][entry.category] || 0) + entry.amount;
          catTotals[entry.category] = (catTotals[entry.category] || 0) + entry.amount;
          weekTotal += entry.amount;
        }

        // Get entries for selected cell detail
        const selectedEntries = selectedCell
          ? livingEntries.filter(
              e => e.day === selectedCell.day && e.category === selectedCell.category
            )
          : [];

        const totalColumns = activeCats.length + 2; // date + cats + subtotal

        return (
          <Card key={wi}>
            <CardHeader className="pb-2 px-3">
              <CardTitle className="text-xs font-bold text-muted-foreground">
                {week.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-2">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="sticky left-0 bg-muted/30 px-2 py-1.5 text-left font-medium w-14">日付</th>
                      {activeCats.map(cat => (
                        <th key={cat} className="px-1.5 py-1.5 text-center font-medium min-w-[48px]">
                          {SHORT_LABELS[cat] || cat.slice(0, 2)}
                        </th>
                      ))}
                      <th className="px-2 py-1.5 text-right font-bold min-w-[56px]">小計</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(({ date, day, inMonth }) => {
                      if (!inMonth) return null;
                      const dow = DAYS_JP[date.getDay()];
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      const rowData = dayData[day] || {};
                      const dayTotal = Object.values(rowData).reduce((s, v) => s + v, 0);
                      const isSelectedDay = selectedCell?.day === day;

                      return (
                        <>
                          <tr key={day} className="border-b border-dashed hover:bg-muted/20">
                            <td className={`sticky left-0 bg-background px-2 py-1.5 font-medium ${isWeekend ? "text-red-500" : ""}`}>
                              {day}({dow})
                            </td>
                            {activeCats.map(cat => {
                              const val = rowData[cat];
                              const isSelected = selectedCell?.day === day && selectedCell?.category === cat;
                              return (
                                <td
                                  key={cat}
                                  className={`px-1 py-1 text-center transition-colors ${
                                    val
                                      ? "cursor-pointer hover:bg-primary/10"
                                      : ""
                                  } ${isSelected ? "bg-primary/15 ring-1 ring-primary/30 rounded" : ""}`}
                                  onClick={() => handleCellClick(day, cat, !!val)}
                                >
                                  {val ? (
                                    <span className="text-foreground">{val.toLocaleString()}</span>
                                  ) : (
                                    <span className="text-muted-foreground/30">-</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-2 py-1.5 text-right font-bold">
                              {dayTotal > 0 ? dayTotal.toLocaleString() : ""}
                            </td>
                          </tr>
                          {/* Detail panel row */}
                          {isSelectedDay && selectedCell && selectedEntries.length > 0 && (
                            <tr key={`detail-${day}`} className="border-b">
                              <td colSpan={totalColumns} className="p-0">
                                <div className="bg-muted/20 px-3 py-2 space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium">
                                      {selectedCell.category}の詳細 ({month}/{day})
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() => setSelectedCell(null)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  {selectedEntries.map(entry => (
                                    <div key={entry.id} className="flex items-center gap-2 text-xs py-1 border-t border-dashed">
                                      <span className="font-bold text-red-600">{formatYen(entry.amount)}</span>
                                      {entry.memo && (
                                        <span className="text-muted-foreground">{entry.memo}</span>
                                      )}
                                      {entry.imageData && (
                                        <img
                                          src={entry.imageData}
                                          alt=""
                                          className="h-8 w-8 object-cover rounded shrink-0"
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                    {/* Week total row */}
                    <tr className="bg-muted/40 font-bold">
                      <td className="sticky left-0 bg-muted/40 px-2 py-1.5">週計</td>
                      {activeCats.map(cat => (
                        <td key={cat} className="px-1 py-1.5 text-center">
                          {catTotals[cat] ? catTotals[cat].toLocaleString() : ""}
                        </td>
                      ))}
                      <td className="px-2 py-1.5 text-right">{weekTotal > 0 ? formatYen(weekTotal) : ""}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {weeklyGroups.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          概要タブから支出を記録すると、ここに自動で表示されます
        </p>
      )}
    </div>
  );
}
