"use client";

import { cn } from "@/lib/utils";
import type { ViewMode } from "@/types/dream";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const modes: { value: ViewMode; label: string }[] = [
  { value: "weekly", label: "週別" },
  { value: "monthly", label: "月別" },
  { value: "yearly", label: "年別" },
];

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 p-0.5 bg-muted rounded-md text-xs">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onViewModeChange(m.value)}
          className={cn(
            "px-3 py-1 rounded transition-colors font-medium",
            viewMode === m.value ? "bg-background shadow-sm" : "hover:bg-background/50"
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
