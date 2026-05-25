"use client";

import Link from "next/link";
import { useBudget } from "@/hooks/use-budget";
import { MonthSelector } from "@/components/budget/MonthSelector";
import { SixGridEntry } from "@/components/budget/SixGridEntry";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Loader2, Share2 } from "lucide-react";

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export default function BudgetPage() {
  const {
    year, month, prevMonth, nextMonth,
    loading,
    addEntry, deleteEntry,
    gridTotals, sixGridSummary,
  } = useBudget();

  const filledCells = gridTotals.filter((g) => g.amount > 0).length;
  const isComplete = filledCells === 6;

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
          <Wallet className="h-6 w-6 text-primary" />
          <h1 className="text-xl md:text-2xl font-bold">ズボラ6マス家計簿</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
          毎日つけるのをやめる。月末に1回、明細を見ながら6マスに振り分けるだけ。
        </p>
      </div>

      {/* Month selector */}
      <MonthSelector year={year} month={month} onPrev={prevMonth} onNext={nextMonth} />

      {/* Summary strip */}
      <Card>
        <CardContent className="grid grid-cols-3 gap-2 py-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground">固定費</p>
            <p className="text-lg font-bold tabular-nums text-blue-600">
              {yen(sixGridSummary.fixedTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">変動費</p>
            <p className="text-lg font-bold tabular-nums text-orange-600">
              {yen(sixGridSummary.variableTotal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">支出合計</p>
            <p className="text-lg font-bold tabular-nums">
              {yen(sixGridSummary.expenseTotal)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 入力進捗 */}
      <div className="px-1">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">入力した枠</span>
          <span className="font-bold tabular-nums">{filledCells}/6 枠</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(filledCells / 6) * 100}%` }}
          />
        </div>
        {isComplete && (
          <p className="text-xs font-semibold text-primary mt-1.5">🎉 今月の家計簿、完成！下のサマリーで振り返ろう</p>
        )}
      </div>

      {/* 6-grid input */}
      <SixGridEntry
        year={year}
        month={month}
        gridTotals={gridTotals}
        onAddEntry={addEntry}
        onDeleteEntry={deleteEntry}
      />

      {/* Share summary link */}
      <div className="flex justify-center pt-2">
        <Link href={`/budget/summary?year=${year}&month=${month}`}>
          <Button variant={isComplete ? "default" : "outline"} size="lg" className="h-12">
            <Share2 className="mr-2 h-4 w-4" />
            月末サマリーを見る（Discord共有用）
          </Button>
        </Link>
      </div>
    </div>
  );
}
