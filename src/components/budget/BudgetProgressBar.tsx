"use client";

import { formatYen } from "@/lib/utils";

interface Props {
  spent: number;
  budget: number;
  showRemaining?: boolean;
  size?: "sm" | "md";
}

function getBarColor(pct: number): string {
  if (pct >= 90) return "bg-red-500";
  if (pct >= 70) return "bg-yellow-500";
  return "bg-green-500";
}

function getBarBg(pct: number): string {
  if (pct >= 90) return "bg-red-100";
  if (pct >= 70) return "bg-yellow-100";
  return "bg-green-100";
}

export function BudgetProgressBar({ spent, budget, showRemaining = true, size = "md" }: Props) {
  if (budget <= 0) return null;

  const pct = Math.round((spent / budget) * 100);
  const clampedPct = Math.min(pct, 100);
  const remaining = budget - spent;
  const isOver = spent > budget;
  const barH = size === "sm" ? "h-2" : "h-3";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {formatYen(spent)} / {formatYen(budget)}
        </span>
        <span className={`font-bold ${isOver ? "text-red-600" : pct >= 70 ? "text-yellow-600" : "text-green-600"}`}>
          {pct}%
        </span>
      </div>
      <div className={`w-full ${barH} rounded-full overflow-hidden ${getBarBg(pct)}`}>
        <div
          className={`${barH} rounded-full transition-all duration-500 ${getBarColor(pct)}`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
      {showRemaining && (
        <p className={`text-xs ${isOver ? "text-red-600 font-bold" : "text-muted-foreground"}`}>
          {isOver
            ? `${formatYen(Math.abs(remaining))} オーバー`
            : `残り ${formatYen(remaining)}`
          }
        </p>
      )}
    </div>
  );
}
