"use client";

import { useState } from "react";
import { formatYen, formatShortDate } from "@/lib/utils";
import { futureValue, futureValue50, multiplierForYears } from "@/lib/dream-calc";
import { COURSES_MAP } from "@/lib/dream-constants";
import { Trash2 } from "lucide-react";
import type { SavingsEntry, CourseId } from "@/types/dream";

interface LedgerRowProps {
  entry: SavingsEntry;
  courseId: CourseId;
  onDelete: (id: number) => void;
}

export function LedgerRow({ entry, courseId, onDelete }: LedgerRowProps) {
  const [showDelete, setShowDelete] = useState(false);
  const fv = futureValue(entry.amount, courseId);
  const fv50 = futureValue50(entry.amount, courseId);
  const course = COURSES_MAP[courseId];
  const ratio20 = Math.round(multiplierForYears(course.annualRate, 10) * 10) / 10;

  return (
    <div
      className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
      onClick={() => setShowDelete(!showDelete)}
    >
      <span className="text-xs text-muted-foreground w-10 shrink-0">
        {formatShortDate(entry.date)}
      </span>
      <span className="text-lg shrink-0">{entry.icon}</span>
      <span className="text-sm flex-1 min-w-0 truncate">{entry.label}</span>
      <span className="text-sm text-muted-foreground shrink-0">
        {formatYen(entry.amount)}
      </span>
      <span className="inline-block px-1 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 shrink-0">
        ×{ratio20}
      </span>
      <span className="text-sm font-bold text-red-500 shrink-0 min-w-[80px] text-right">
        + {formatYen(fv)}
      </span>
      <span className="text-sm font-bold text-purple-500 shrink-0 min-w-[80px] text-right">
        + {formatYen(fv50)}
      </span>
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entry.id!);
          }}
          className="shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
