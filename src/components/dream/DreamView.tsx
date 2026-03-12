"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Pencil, Target } from "lucide-react";
import { formatYen } from "@/lib/utils";
import { totalFutureValue, dreamProgress, blurLevel } from "@/lib/dream-calc";
import type { DreamGoal, SavingsEntry, CourseId } from "@/types/dream";
import { DreamEditor } from "./DreamEditor";

interface DreamViewProps {
  dream: DreamGoal | null;
  entries: SavingsEntry[];
  courseId: CourseId;
  onSaveDream: (data: { title: string; targetAmount: number; photoData: string }) => Promise<void>;
}

export function DreamView({ dream, entries, courseId, onSaveDream }: DreamViewProps) {
  const [editorOpen, setEditorOpen] = useState(false);

  const totalFV = totalFutureValue(entries, courseId);
  const progress = dream ? dreamProgress(totalFV, dream.targetAmount) : 0;
  const blur = blurLevel(progress);
  const progressPct = Math.min(Math.round(progress * 100), 100);
  const remaining = dream ? Math.max(0, dream.targetAmount - totalFV) : 0;
  const isCompleted = progress >= 1;

  if (!dream) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Target className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-lg">夢を設定して節約をはじめよう！</h3>
            <p className="text-sm text-muted-foreground mt-1">
              叶えたい夢の写真と目標金額を設定すると、節約するたびに夢が鮮明になります
            </p>
          </div>
          <Button onClick={() => setEditorOpen(true)}>
            <Sparkles className="h-4 w-4 mr-1" />
            夢を設定する
          </Button>
          {editorOpen && (
            <DreamEditor
              dream={null}
              onSave={async (data) => {
                await onSaveDream(data);
                setEditorOpen(false);
              }}
              onClose={() => setEditorOpen(false)}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Dream photo with blur */}
          <div className="relative h-48 md:h-56 overflow-hidden">
            <img
              src={dream.photoData}
              alt={dream.title}
              className="w-full h-full object-cover transition-[filter] duration-800 ease-out"
              style={{ filter: `blur(${blur}px)` }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Edit button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={() => setEditorOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* Celebration overlay */}
            {isCompleted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="text-center">
                  <span className="text-4xl">🎉</span>
                  <p className="text-white font-bold text-lg mt-2">
                    おめでとう！夢が実現できます！
                  </p>
                </div>
              </div>
            )}

            {/* Dream info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg">{dream.title}</h3>
              <p className="text-white/80 text-sm">
                目標: {formatYen(dream.targetAmount)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="p-4">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">達成率</span>
              <span className="font-bold text-primary">{progressPct}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {!isCompleted && (
              <p className="text-xs text-muted-foreground mt-1.5">
                {dream.title}まであと {formatYen(remaining)}（20年後換算）
              </p>
            )}
          </div>
        </div>
      </Card>

      {editorOpen && (
        <DreamEditor
          dream={dream}
          onSave={async (data) => {
            await onSaveDream(data);
            setEditorOpen(false);
          }}
          onClose={() => setEditorOpen(false)}
        />
      )}
    </>
  );
}
