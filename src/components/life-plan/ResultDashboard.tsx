"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Landmark,
  Banknote,
  Wallet,
} from "lucide-react";
import type { LifePlanSummary } from "@/types/life-plan";

interface Props {
  summary: LifePlanSummary;
}

export function ResultDashboard({ summary }: Props) {
  const isDeficit = summary.finalNetWorth < 0;
  const hasShortfall = summary.shortfallAge !== null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold">シミュレーション結果</h3>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 生涯収入 */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Banknote className="w-3.5 h-3.5" />
              生涯収入
            </div>
            <p className="text-lg font-black text-emerald-600">
              {summary.totalLifetimeIncome.toLocaleString()}
              <span className="text-xs font-normal ml-0.5">万円</span>
            </p>
          </CardContent>
        </Card>

        {/* 生涯支出 */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Wallet className="w-3.5 h-3.5" />
              生涯支出
            </div>
            <p className="text-lg font-black text-rose-600">
              {summary.totalLifetimeExpense.toLocaleString()}
              <span className="text-xs font-normal ml-0.5">万円</span>
            </p>
          </CardContent>
        </Card>

        {/* 退職時資産 */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <Landmark className="w-3.5 h-3.5" />
              退職時資産
            </div>
            <p
              className={`text-lg font-black ${
                summary.retirementNetWorth >= 0
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {summary.retirementNetWorth.toLocaleString()}
              <span className="text-xs font-normal ml-0.5">万円</span>
            </p>
          </CardContent>
        </Card>

        {/* 最終資産 */}
        <Card className={isDeficit ? "border-rose-300 dark:border-rose-700" : ""}>
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              {isDeficit ? (
                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              )}
              最終資産（寿命時）
            </div>
            <p
              className={`text-lg font-black ${
                isDeficit ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {summary.finalNetWorth.toLocaleString()}
              <span className="text-xs font-normal ml-0.5">万円</span>
            </p>
          </CardContent>
        </Card>

        {/* 資産不足警告 */}
        {hasShortfall && (
          <Card className="border-rose-300 dark:border-rose-700 col-span-2">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 text-xs text-rose-600 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                資産不足警告
              </div>
              <p className="text-sm">
                <span className="font-black text-rose-600">
                  {summary.shortfallAge}歳
                </span>
                <span className="text-muted-foreground">
                  で資産がマイナスに。最大不足額{" "}
                </span>
                <span className="font-black text-rose-600">
                  {summary.shortfallAmount?.toLocaleString()}万円
                </span>
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
