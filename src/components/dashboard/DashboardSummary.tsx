"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Wallet, Target, ArrowRight } from "lucide-react";
import { useDream } from "@/hooks/use-dream";
import { useSavings } from "@/hooks/use-savings";
import { usePreferences } from "@/hooks/use-preferences";
import { totalFutureValue, dreamProgress } from "@/lib/dream-calc";
import { formatYen } from "@/lib/utils";

/**
 * ダッシュボード上部の「今月のあなた」サマリー。
 * 節約ドリーム（IndexedDB）と連動し、会員の現在地と次の一歩を出す。
 * データが空の新規会員には「はじめの一歩」を促す。
 */
export function DashboardSummary() {
  const { dream, loading: dreamLoading } = useDream();
  const { entries, loading: savingsLoading } = useSavings();
  const { courseId } = usePreferences();

  if (dreamLoading || savingsLoading) {
    return <div className="h-28 rounded-2xl border bg-muted/30 animate-pulse" />;
  }

  // 今月の記録
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = entries.filter((e) => e.date.startsWith(ym));
  const monthAmount = thisMonth.reduce((s, e) => s + e.amount, 0);
  const monthFV = totalFutureValue(thisMonth, courseId);

  const hasAnyData = entries.length > 0 || !!dream;

  // ── 新規会員（データなし）：はじめの一歩 ──
  if (!hasAnyData) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-brand/5">
        <CardContent className="p-5 md:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <p className="font-bold text-lg">さあ、はじめましょう</p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            最初の一歩は「叶えたい夢」を決めること。節約するたびに、その夢が10年後・20年後にいくらになるかが見えます。
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href="/dream">
              <Button size="sm">
                <Sparkles className="mr-1 h-4 w-4" />
                夢を決める
              </Button>
            </Link>
            <Link href="/guide">
              <Button size="sm" variant="outline">
                進め方を見る
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── 利用中の会員：今月のサマリー ──
  const progressPct = dream
    ? Math.min(Math.round(dreamProgress(totalFutureValue(entries, courseId), dream.targetAmount) * 100), 100)
    : null;

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
          <div className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" /> 今月の節約
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums">{formatYen(monthAmount)}</p>
            <p className="text-[11px] text-muted-foreground">{thisMonth.length}回 記録</p>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> 10年後の価値
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
              {formatYen(monthFV)}
            </p>
            <p className="text-[11px] text-muted-foreground">今月分を投資したら</p>
          </div>
          <div className="col-span-2 p-4 sm:col-span-2">
            {dream && progressPct !== null ? (
              <Link href="/dream" className="group block">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Target className="h-3.5 w-3.5" /> 夢「{dream.title}」まで
                </div>
                <div className="mt-1 flex items-center gap-3">
                  <p className="text-xl font-bold tabular-nums text-primary">{progressPct}%</p>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">節約を続けて夢を鮮明に</p>
              </Link>
            ) : (
              <Link href="/dream" className="group flex h-full flex-col justify-center">
                <p className="text-sm font-semibold">夢を決めると、もっと楽しくなる🎯</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  叶えたい夢を設定する
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </p>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
