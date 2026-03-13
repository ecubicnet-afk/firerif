"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import { CourseSwitcher } from "./CourseSwitcher";
import { MonthlySummary } from "./MonthlySummary";
import { LedgerRow } from "./LedgerRow";
import { ViewToggle } from "./ViewToggle";
import type { SavingsEntry, CourseId, ViewMode } from "@/types/dream";

interface LedgerProps {
  entries: SavingsEntry[];
  courseId: CourseId;
  viewMode: ViewMode;
  onCourseChange: (courseId: CourseId) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onDeleteEntry: (id: number) => void;
}

export function Ledger({
  entries,
  courseId,
  viewMode,
  onCourseChange,
  onViewModeChange,
  onDeleteEntry,
}: LedgerProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [weekOffset, setWeekOffset] = useState(0);

  const filteredEntries = useMemo(() => {
    if (viewMode === "yearly") {
      const prefix = `${year}-`;
      return entries.filter((e) => e.date.startsWith(prefix));
    }
    if (viewMode === "monthly") {
      const prefix = `${year}-${String(month).padStart(2, "0")}`;
      return entries.filter((e) => e.date.startsWith(prefix));
    }
    // Weekly
    const ref = new Date();
    ref.setDate(ref.getDate() + weekOffset * 7);
    const start = new Date(ref);
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];
    return entries.filter((e) => e.date >= startStr && e.date < endStr);
  }, [entries, viewMode, year, month, weekOffset]);

  function prevPeriod() {
    if (viewMode === "yearly") {
      setYear(year - 1);
    } else if (viewMode === "monthly") {
      if (month === 1) { setYear(year - 1); setMonth(12); }
      else setMonth(month - 1);
    } else {
      setWeekOffset(weekOffset - 1);
    }
  }

  function nextPeriod() {
    if (viewMode === "yearly") {
      setYear(year + 1);
    } else if (viewMode === "monthly") {
      if (month === 12) { setYear(year + 1); setMonth(1); }
      else setMonth(month + 1);
    } else {
      setWeekOffset(weekOffset + 1);
    }
  }

  function periodLabel() {
    if (viewMode === "yearly") {
      return `${year}年`;
    }
    if (viewMode === "monthly") {
      return `${year}年${month}月`;
    }
    const ref = new Date();
    ref.setDate(ref.getDate() + weekOffset * 7);
    const start = new Date(ref);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.getMonth() + 1}/${start.getDate()} 〜 ${end.getMonth() + 1}/${end.getDate()}`;
  }

  return (
    <div className="space-y-4">
      {/* Course switcher */}
      <CourseSwitcher courseId={courseId} onCourseChange={onCourseChange} />

      {/* Period navigation */}
      <div className="flex items-center justify-between">
        <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevPeriod}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold min-w-[100px] text-center">
            {periodLabel()}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextPeriod}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary */}
      <MonthlySummary
        entries={filteredEntries}
        courseId={courseId}
        label={periodLabel() + " のサマリー"}
      />

      {/* Entry list */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <ScrollText className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm">未来家計簿リスト</CardTitle>
          </div>
          {/* Table header */}
          <div className="flex items-center gap-3 py-1 px-3 text-[10px] text-muted-foreground font-medium">
            <span className="w-10">日付</span>
            <span className="text-lg invisible">📦</span>
            <span className="flex-1">内容</span>
            <span>節約額</span>
            <span className="min-w-[80px] text-right">🚀 20年後</span>
            <span className="min-w-[80px] text-right">✨ 50年後</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredEntries.length > 0 ? (
            <div className="divide-y">
              {filteredEntries.map((entry) => (
                <LedgerRow
                  key={entry.id}
                  entry={entry}
                  courseId={courseId}
                  onDelete={onDeleteEntry}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              この期間の記録はまだありません
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
