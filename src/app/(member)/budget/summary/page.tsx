"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  SIX_GRID_CELLS,
  COST_TYPE_CONFIG,
  PAY_METHOD_CONFIG,
} from "@/lib/budget-categories";
import type { BudgetEntry } from "@/hooks/use-budget";

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

function prevYM(year: number, month: number) {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

async function fetchMonth(year: number, month: number): Promise<BudgetEntry[]> {
  const res = await fetch(`/api/budget?year=${year}&month=${month}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function expenseTotal(entries: BudgetEntry[]) {
  return entries
    .filter((e) => e.type === "EXPENSE")
    .reduce((s, e) => s + e.amount, 0);
}

function SummaryLoading() {
  return (
    <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function BudgetSummaryPage() {
  return (
    <Suspense fallback={<SummaryLoading />}>
      <BudgetSummaryContent />
    </Suspense>
  );
}

function BudgetSummaryContent() {
  const params = useSearchParams();
  const now = new Date();
  const year = parseInt(params.get("year") || String(now.getFullYear()), 10);
  const month = parseInt(params.get("month") || String(now.getMonth() + 1), 10);

  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [prevEntries, setPrevEntries] = useState<BudgetEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [memo, setMemo] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    const p = prevYM(year, month);
    Promise.all([fetchMonth(year, month), fetchMonth(p.year, p.month)])
      .then(([cur, prev]) => {
        if (!active) return;
        setEntries(cur);
        setPrevEntries(prev);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [year, month]);

  const sixGrid = useMemo(
    () => entries.filter((e) => e.type === "EXPENSE" && e.costType && e.payMethod),
    [entries]
  );

  const fixedTotal = useMemo(
    () => sixGrid.filter((e) => e.costType === "FIXED").reduce((s, e) => s + e.amount, 0),
    [sixGrid]
  );
  const variableTotal = useMemo(
    () => sixGrid.filter((e) => e.costType === "VARIABLE").reduce((s, e) => s + e.amount, 0),
    [sixGrid]
  );
  const total = fixedTotal + variableTotal;

  const gridTotals = useMemo(
    () =>
      SIX_GRID_CELLS.map((cell) => ({
        ...cell,
        amount: sixGrid
          .filter((e) => e.costType === cell.costType && e.payMethod === cell.payMethod)
          .reduce((s, e) => s + e.amount, 0),
      })),
    [sixGrid]
  );

  // 財布別（クレカ/口座/現金）の小計
  const walletTotals = useMemo(
    () => ({
      CARD: sixGrid.filter((e) => e.payMethod === "CARD").reduce((s, e) => s + e.amount, 0),
      BANK: sixGrid.filter((e) => e.payMethod === "BANK").reduce((s, e) => s + e.amount, 0),
      CASH: sixGrid.filter((e) => e.payMethod === "CASH").reduce((s, e) => s + e.amount, 0),
    }),
    [sixGrid]
  );

  // 固定費ランキング TOP3
  const fixedRanking = useMemo(() => {
    const map: Record<string, number> = {};
    sixGrid
      .filter((e) => e.costType === "FIXED")
      .forEach((e) => {
        map[e.category] = (map[e.category] || 0) + e.amount;
      });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [sixGrid]);

  const prevTotal = useMemo(() => expenseTotal(prevEntries), [prevEntries]);
  const diff = total - prevTotal;

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      {/* Nav (除外したい場合はスクショ時に枠外) */}
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/budget?year=${year}&month=${month}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            家計簿に戻る
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground">
          この画面をスクショしてDiscordで共有しよう
        </p>
      </div>

      {/* スクショ対象カード */}
      <Card className="shadow-sm">
        <CardHeader className="text-center border-b">
          <CardTitle className="text-xl">
            {year}年{month}月 家計の健康診断
          </CardTitle>
          <p className="text-sm text-muted-foreground">月末サマリー（6枠家計簿）</p>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          {/* 合計 */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-blue-50 py-3">
              <p className="text-xs text-muted-foreground">固定費</p>
              <p className="text-lg font-bold tabular-nums text-blue-600">{yen(fixedTotal)}</p>
            </div>
            <div className="rounded-lg bg-orange-50 py-3">
              <p className="text-xs text-muted-foreground">変動費</p>
              <p className="text-lg font-bold tabular-nums text-orange-600">{yen(variableTotal)}</p>
            </div>
            <div className="rounded-lg bg-muted py-3">
              <p className="text-xs text-muted-foreground">支出合計</p>
              <p className="text-lg font-bold tabular-nums">{yen(total)}</p>
            </div>
          </div>

          {/* 財布別の内訳 */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">財布別の内訳（どの財布で使ったか）</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/50 py-3">
                <p className="text-xs text-muted-foreground">💳 クレカ</p>
                <p className="text-base font-bold tabular-nums">{yen(walletTotals.CARD)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 py-3">
                <p className="text-xs text-muted-foreground">🏦 口座</p>
                <p className="text-base font-bold tabular-nums">{yen(walletTotals.BANK)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 py-3">
                <p className="text-xs text-muted-foreground">💵 現金</p>
                <p className="text-base font-bold tabular-nums">{yen(walletTotals.CASH)}</p>
              </div>
            </div>
          </div>

          {/* 6枠内訳 */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">6枠の内訳</h3>
            <div className="grid grid-cols-2 gap-2">
              {gridTotals.map((g) => (
                <div
                  key={`${g.costType}-${g.payMethod}`}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
                      {g.num}
                    </span>
                    <span className={COST_TYPE_CONFIG[g.costType].color}>
                      {COST_TYPE_CONFIG[g.costType].label}
                    </span>
                    <span className="text-muted-foreground">×</span>
                    <span>{PAY_METHOD_CONFIG[g.payMethod].short}</span>
                  </span>
                  <span className="font-medium tabular-nums">{yen(g.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 固定費ランキング */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">
              固定費ランキング（削減候補 TOP3）
            </h3>
            {fixedRanking.length === 0 ? (
              <p className="text-sm text-muted-foreground">固定費の記録がありません。</p>
            ) : (
              <ol className="space-y-1">
                {fixedRanking.map((r, i) => (
                  <li
                    key={r.category}
                    className="flex items-center justify-between rounded-md bg-blue-50/60 px-3 py-2 text-sm"
                  >
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-blue-600">{i + 1}位</span>
                      {r.category}
                    </span>
                    <span className="font-medium tabular-nums">{yen(r.amount)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* 前月比 */}
          <div className="rounded-lg border px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">前月の支出合計</span>
              <span className="tabular-nums">{yen(prevTotal)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm font-semibold">前月比</span>
              {prevTotal === 0 ? (
                <span className="text-sm text-muted-foreground">前月データなし</span>
              ) : diff < 0 ? (
                <span className="font-bold text-green-600">
                  {yen(Math.abs(diff))} 削減できた！
                </span>
              ) : diff > 0 ? (
                <span className="font-bold text-red-500">+{yen(diff)} 増えた</span>
              ) : (
                <span className="font-bold text-muted-foreground">±0</span>
              )}
            </div>
          </div>

          {/* ひとことメモ */}
          <div>
            <h3 className="mb-2 text-sm font-semibold">ひとことメモ（今月削ったもの）</h3>
            <Input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="例: サブスク2つ解約・通信費を格安SIMに"
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
