"use client";

import { cn } from "@/lib/utils";
import type { ViewMode } from "@/types/dream";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex gap-1 p-0.5 bg-muted rounded-md text-xs">
      <button
        onClick={() => onViewModeChange("monthly")}
        className={cn(
          "px-3 py-1 rounded transition-colors font-medium",
          viewMode === "monthly" ? "bg-background shadow-sm" : "hover:bg-background/50"
        )}
      >
        月別
      </button>
      <button
        onClick={() => onViewModeChange("weekly")}
        className={cn(
          "px-3 py-1 rounded transition-colors font-medium",
          viewMode === "weekly" ? "bg-background shadow-sm" : "hover:bg-background/50"
        )}
      >
        週別
      </button>
    </div>
  );
}
