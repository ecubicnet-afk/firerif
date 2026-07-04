"use client";

import { useState } from "react";
import Link from "next/link";
import { useBudget } from "@/hooks/use-budget";
import { MonthSelector } from "@/components/budget/MonthSelector";
import { SixGridEntry } from "@/components/budget/SixGridEntry";
import { BudgetTrend } from "@/components/budget/BudgetTrend";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Loader2, Share2, TrendingUp, BookOpen, Copy } from "lucide-react";

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export default function BudgetPage() {
  const {
    year, month, prevMonth, nextMonth,
    loading,
    addEntry, deleteEntry, updateEntry,
    gridTotals, sixGridSummary,
    trend, monthOverMonth, fetchTrend,
    fetchPrevMonthFixed,
  } = useBudget();

  const [showTrend, setShowTrend] = useState(false);
  const [copying, setCopying] = useState(false);

  const filledCells = gridTotals.filter((g) => g.amount > 0).length;

  async function handleCopyPrevFixed() {
    if (copying) return;
    const prev = await fetchPrevMonthFixed();
    if (prev.length === 0) {
      window.alert("先月の固定費データが見つかりませんでした。まず固定費を入力してみてください。");
      return;
    }
    const total = prev.reduce((s, e) => s + e.amount, 0);
    const yenStr = `¥${total.toLocaleString("ja-JP")}`;
    if (!window.confirm(`先月の固定費 ${prev.length}件（合計${yenStr}）を今月にコピーします。よろしいですか？`)) return;
    setCopying(true);
    try {
      for (const e of prev) {
        await addEntry({
          year, month, day: 1,
          category: e.category, amount: e.amount,
          type: "EXPENSE",
          costType: e.costType, payMethod: e.payMethod,
        });
      }
    } finally {
      setCopying(false);
    }
  }
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
        <a
          href="https://money-compass.net/kakeibo-susume-beginners/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <BookOpen className="h-3.5 w-3.5" />
          詳しい使い方・考え方はこちら（解説記事）
        </a>
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
          <div className="rounded-md bg-primary/5 py-1">
            <p className="text-xs text-muted-foreground">支出合計</p>
            <p className="text-xl font-extrabold tabular-nums text-primary">
              {yen(sixGridSummary.expenseTotal)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 前月比 + 推移トグル */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="text-sm">
          {monthOverMonth ? (
            monthOverMonth.diff === 0 ? (
              <span className="text-muted-foreground">前月と同じ支出ペースです</span>
            ) : monthOverMonth.diff < 0 ? (
              <span className="font-semibold text-emerald-600">
                前月比 ▼{yen(Math.abs(monthOverMonth.diff))} 減らせています ✨
              </span>
            ) : (
              <span className="font-semibold text-orange-600">
                前月比 ▲{yen(monthOverMonth.diff)} 増えています
              </span>
            )
          ) : (
            <span className="text-muted-foreground">前月のデータがたまると前月比が出ます</span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 shrink-0"
          onClick={() => {
            if (!showTrend) fetchTrend();
            setShowTrend((v) => !v);
          }}
        >
          <TrendingUp className="mr-1 h-4 w-4" />
          推移を見る
        </Button>
      </div>

      {showTrend && (
        <Card>
          <CardContent className="py-4">
            <BudgetTrend trend={trend} />
          </CardContent>
        </Card>
      )}

      {/* 固定費を減らせた時の称賛（A: モチベ演出） */}
      {monthOverMonth && monthOverMonth.fixedDiff < 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          🎉 固定費を前月より {yen(Math.abs(monthOverMonth.fixedDiff))} 減らせました。固定費の見直しは一度やればずっと効きます✨
        </div>
      )}

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

      {/* はじめての人へのガイド（B: 迷わせない・データ0の時だけ） */}
      {filledCells === 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm leading-relaxed text-blue-900">
          <p className="mb-1 font-semibold">はじめての方へ</p>
          <p>
            まずは<span className="font-semibold">固定費</span>から。スマホでクレカ明細を開いて、毎月の通信費・サブスク・保険を「💳クレカ → ① 固定費」に入れてみましょう。金額だけでOK、項目名は省略できます。
          </p>
        </div>
      )}

      {/* 先月の固定費コピー */}
      <button
        type="button"
        onClick={handleCopyPrevFixed}
        disabled={copying}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50/60 px-3 py-2.5 text-sm font-medium text-blue-700 active:bg-blue-100 disabled:opacity-60"
      >
        <Copy className="h-4 w-4" />
        {copying ? "コピー中..." : "先月の固定費をコピー（家賃・通信など毎月同じ分）"}
      </button>

      {/* 6-grid input */}
      <SixGridEntry
        year={year}
        month={month}
        gridTotals={gridTotals}
        onAddEntry={addEntry}
        onDeleteEntry={deleteEntry}
        onUpdateEntry={updateEntry}
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
