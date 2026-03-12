"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  onAddEntry: (data: {
    year: number; month: number; day: number;
    category: string; amount: number;
    type: "INCOME" | "EXPENSE" | "SAVING";
    memo?: string;
  }) => Promise<void>;
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

export function WeeklyGrid({ year, month, weeklyGroups, onAddEntry }: Props) {
  const [editCell, setEditCell] = useState<{ day: number; category: string } | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [saving, setSaving] = useState(false);

  // Get categories that have data or are commonly used
  const activeCats = LIVING_EXPENSE_CATEGORIES.slice(0, 8); // Show first 8 for width

  async function handleSave() {
    if (!editCell || !editAmount || saving) return;
    setSaving(true);
    try {
      await onAddEntry({
        year, month,
        day: editCell.day,
        category: editCell.category,
        amount: parseInt(editAmount),
        type: "EXPENSE",
      });
      setEditCell(null);
      setEditAmount("");
    } finally {
      setSaving(false);
    }
  }

  function handleCellClick(day: number, category: string) {
    setEditCell({ day, category });
    setEditAmount("");
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
          e => e.type === "EXPENSE" && getExpenseGroup(e.category) === "生活費"
        );

        for (const entry of livingEntries) {
          const key = entry.day || 1;
          if (!dayData[key]) dayData[key] = {};
          dayData[key][entry.category] = (dayData[key][entry.category] || 0) + entry.amount;
          catTotals[entry.category] = (catTotals[entry.category] || 0) + entry.amount;
          weekTotal += entry.amount;
        }

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

                      return (
                        <tr key={day} className="border-b border-dashed hover:bg-muted/20">
                          <td className={`sticky left-0 bg-background px-2 py-1.5 font-medium ${isWeekend ? "text-red-500" : ""}`}>
                            {day}({dow})
                          </td>
                          {activeCats.map(cat => {
                            const val = rowData[cat];
                            const isEditing = editCell?.day === day && editCell?.category === cat;
                            return (
                              <td
                                key={cat}
                                className="px-1 py-1 text-center cursor-pointer hover:bg-primary/10 transition-colors"
                                onClick={() => handleCellClick(day, cat)}
                              >
                                {isEditing ? (
                                  <div className="flex items-center gap-0.5">
                                    <Input
                                      type="number"
                                      value={editAmount}
                                      onChange={(e) => setEditAmount(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSave();
                                        if (e.key === "Escape") setEditCell(null);
                                      }}
                                      className="h-6 w-14 text-xs px-1 text-center"
                                      autoFocus
                                    />
                                    <Button size="icon" variant="ghost" className="h-5 w-5 shrink-0" onClick={() => setEditCell(null)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : val ? (
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
          セルをタップして生活費を入力してください
        </p>
      )}
    </div>
  );
}
