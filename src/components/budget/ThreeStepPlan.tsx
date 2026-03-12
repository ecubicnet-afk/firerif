"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatYen } from "@/lib/utils";
import type { BudgetPlan } from "@/hooks/use-budget";

interface Props {
  year: number;
  month: number;
  totals: {
    salary: number;
    livingExpense: number;
    fixedCost: number;
    baseExpense: number;
    baseBalance: number;
  };
  plans: BudgetPlan[];
  onAddPlan: (data: {
    year: number; month: number;
    category: string; amount: number;
    type: "INCOME" | "EXPENSE" | "SAVING";
  }) => Promise<void>;
}

export function ThreeStepPlan({ year, month, totals, plans, onAddPlan }: Props) {
  const [targetBalance, setTargetBalance] = useState("");
  const [livingReduction, setLivingReduction] = useState("");
  const [fixedReduction, setFixedReduction] = useState("");
  const [saving, setSaving] = useState(false);

  // Load existing plans
  const existingTarget = plans.find(p => p.category === "ベース収支目標");
  const existingLivingR = plans.find(p => p.category === "変動費削減目標");
  const existingFixedR = plans.find(p => p.category === "固定費削減目標");

  // Next month
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  async function handleSavePlan() {
    if (saving) return;
    setSaving(true);
    try {
      const promises = [];
      if (targetBalance) {
        promises.push(onAddPlan({
          year: nextYear, month: nextMonth,
          category: "ベース収支目標",
          amount: parseInt(targetBalance),
          type: "SAVING",
        }));
      }
      if (livingReduction) {
        promises.push(onAddPlan({
          year: nextYear, month: nextMonth,
          category: "変動費削減目標",
          amount: parseInt(livingReduction),
          type: "EXPENSE",
        }));
      }
      if (fixedReduction) {
        promises.push(onAddPlan({
          year: nextYear, month: nextMonth,
          category: "固定費削減目標",
          amount: parseInt(fixedReduction),
          type: "EXPENSE",
        }));
      }
      await Promise.all(promises);
      setTargetBalance("");
      setLivingReduction("");
      setFixedReduction("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Step 1 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs mr-2">Step 1</span>
            {month}月の「ベース支出」をまとめる！
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <div className="text-center p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 min-w-[100px]">
              <p className="text-[10px] text-muted-foreground">変動費</p>
              <p className="font-bold text-orange-600">{formatYen(totals.livingExpense)}</p>
            </div>
            <span className="text-lg font-bold">+</span>
            <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 min-w-[100px]">
              <p className="text-[10px] text-muted-foreground">固定費</p>
              <p className="font-bold text-blue-600">{formatYen(totals.fixedCost)}</p>
            </div>
            <span className="text-lg font-bold">=</span>
            <div className="text-center p-3 rounded-lg bg-muted min-w-[120px]">
              <p className="text-[10px] text-muted-foreground">ベース支出</p>
              <p className="font-bold text-lg">{formatYen(totals.baseExpense)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs mr-2">Step 2</span>
            {month}月の「ベース収支」を計算する！
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20 min-w-[100px]">
              <p className="text-[10px] text-muted-foreground">毎月の給料</p>
              <p className="font-bold text-green-600">{formatYen(totals.salary)}</p>
            </div>
            <span className="text-lg font-bold">−</span>
            <div className="text-center p-2 rounded-lg bg-muted min-w-[100px]">
              <p className="text-[10px] text-muted-foreground">ベース支出</p>
              <p className="font-bold">{formatYen(totals.baseExpense)}</p>
            </div>
            <span className="text-lg font-bold">=</span>
            <div className={`text-center p-3 rounded-lg min-w-[120px] ${totals.baseBalance >= 0 ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}`}>
              <p className="text-[10px] text-muted-foreground">ベース収支</p>
              <p className={`font-bold text-lg ${totals.baseBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatYen(totals.baseBalance)}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            ※ボーナスや臨時収入を除いたベースとなる給料
          </p>
        </CardContent>
      </Card>

      {/* Step 3 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">
            <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs mr-2">Step 3</span>
            {nextMonth}月の「ベース収支」の目標を立てる！
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {existingTarget && (
            <div className="p-2 rounded-lg bg-muted text-sm">
              <p className="text-[10px] text-muted-foreground">現在の目標</p>
              <p className="font-bold">{formatYen(existingTarget.amount)}</p>
              {existingLivingR && (
                <p className="text-xs text-muted-foreground">
                  変動費削減: {formatYen(existingLivingR.amount)}
                </p>
              )}
              {existingFixedR && (
                <p className="text-xs text-muted-foreground">
                  固定費削減: {formatYen(existingFixedR.amount)}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs w-32 shrink-0">ベース収支の目標</label>
              <Input
                type="number"
                value={targetBalance}
                onChange={(e) => setTargetBalance(e.target.value)}
                placeholder={existingTarget ? String(existingTarget.amount) : "目標額"}
                className="h-8 text-sm"
              />
              <span className="text-xs text-muted-foreground shrink-0">円</span>
            </div>

            <p className="text-xs text-muted-foreground ml-1">これを実現するために…</p>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded-lg border space-y-1">
                <p className="text-[10px] text-muted-foreground">変動費の削減目標</p>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={livingReduction}
                    onChange={(e) => setLivingReduction(e.target.value)}
                    placeholder={existingLivingR ? String(existingLivingR.amount) : "0"}
                    className="h-7 text-xs"
                  />
                  <span className="text-[10px] shrink-0">円</span>
                </div>
              </div>
              <div className="p-2 rounded-lg border space-y-1">
                <p className="text-[10px] text-muted-foreground">固定費の削減目標</p>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={fixedReduction}
                    onChange={(e) => setFixedReduction(e.target.value)}
                    placeholder={existingFixedR ? String(existingFixedR.amount) : "0"}
                    className="h-7 text-xs"
                  />
                  <span className="text-[10px] shrink-0">円</span>
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={handleSavePlan}
              disabled={saving || (!targetBalance && !livingReduction && !fixedReduction)}
              className="w-full"
            >
              {saving ? "保存中..." : "目標を保存"}
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground">
            💡 ベース収支を1,000円増やせただけで1年間で12,000円も差が出るよ！
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
