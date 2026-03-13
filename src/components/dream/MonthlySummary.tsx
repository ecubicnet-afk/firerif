"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatYen } from "@/lib/utils";
import { totalFutureValue, totalFutureValue50, totalSavings, multiplierForYears } from "@/lib/dream-calc";
import { COURSES_MAP } from "@/lib/dream-constants";
import type { SavingsEntry, CourseId } from "@/types/dream";
import { TrendingUp, Wallet } from "lucide-react";

interface MonthlySummaryProps {
  entries: SavingsEntry[];
  courseId: CourseId;
  label: string;
}

export function MonthlySummary({ entries, courseId, label }: MonthlySummaryProps) {
  const actual = totalSavings(entries);
  const future = totalFutureValue(entries, courseId);
  const future50 = totalFutureValue50(entries, courseId);
  const course = COURSES_MAP[courseId];
  const mult20 = Math.round(multiplierForYears(course.annualRate, 20) * 10) / 10;
  const mult50 = Math.round(multiplierForYears(course.annualRate, 50) * 10) / 10;

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">{label}</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              実際の節約額
            </div>
            <p className="text-lg font-bold">{formatYen(actual)}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{course.icon} 20年後の価値</span>
            </div>
            <p className="text-xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
              {formatYen(future)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>✨ 50年後の価値</span>
            </div>
            <p className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {formatYen(future50)}
            </p>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          ※{course.indexName}（年利{(course.annualRate * 100).toFixed(0)}%）で複利計算：20年後{mult20}倍・50年後{mult50}倍換算
        </p>
      </CardContent>
    </Card>
  );
}
