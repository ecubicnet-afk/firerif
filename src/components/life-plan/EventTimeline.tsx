"use client";

import type { YearlyProjection } from "@/types/life-plan";

interface Props {
  projections: YearlyProjection[];
}

export function EventTimeline({ projections }: Props) {
  const milestoneYears = projections.filter((p) => p.milestones.length > 0);

  if (milestoneYears.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-muted-foreground">
        ライフイベントがありません
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-bold mb-3">ライフイベント</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-3">
          {milestoneYears.map((p) => (
            <div key={p.age} className="relative pl-8">
              {/* Dot */}
              <div
                className={`absolute left-1.5 top-1 w-3 h-3 rounded-full border-2 ${
                  p.netWorth >= 0
                    ? "bg-emerald-100 border-emerald-500 dark:bg-emerald-900/50"
                    : "bg-rose-100 border-rose-500 dark:bg-rose-900/50"
                }`}
              />

              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-xs font-bold text-muted-foreground w-10">
                  {p.age}歳
                </span>
                {p.milestones.map((m, i) => (
                  <span
                    key={i}
                    className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    {m}
                  </span>
                ))}
                <span
                  className={`text-[10px] ml-auto ${
                    p.netWorth >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  資産 {p.netWorth.toLocaleString()}万円
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
