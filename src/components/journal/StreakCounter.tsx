"use client";

import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StreakCounterProps {
  currentStreak: number;
  totalEntries: number;
}

export function StreakCounter({
  currentStreak,
  totalEntries,
}: StreakCounterProps) {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-full bg-primary/10 p-3">
          <Flame className="h-8 w-8 text-primary" />
        </div>
        <div>
          {currentStreak > 0 ? (
            <>
              <p className="text-2xl font-bold">
                連続 {currentStreak} 日
              </p>
              <p className="text-sm text-muted-foreground">
                累計 {totalEntries} 件の記録
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-bold">今日から始めよう！</p>
              <p className="text-sm text-muted-foreground">
                {totalEntries > 0
                  ? `累計 ${totalEntries} 件の記録があります`
                  : "毎日の節約を記録して習慣にしましょう"}
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
