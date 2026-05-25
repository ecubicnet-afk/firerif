"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Pencil, Target } from "lucide-react";
import { formatYen } from "@/lib/utils";
import { totalFutureValue, totalFutureValue50, dreamProgress, dreamFilter, DREAM_FILTER_LOCKED } from "@/lib/dream-calc";
import type { DreamGoal, SavingsEntry, CourseId } from "@/types/dream";
import { DreamEditor } from "./DreamEditor";

interface DreamViewProps {
  dream: DreamGoal | null;
  entries: SavingsEntry[];
  courseId: CourseId;
  onSaveDream: (data: { title: string; targetAmount: number; photoData: string }) => Promise<void>;
}

function clarityMessage(pct: number): { icon: string; text: string } {
  if (pct === 0) return { icon: "🌫️", text: "節約を始めると、夢が色づいてハッキリ見えてくる…" };
  if (pct < 20) return { icon: "🔍", text: "夢がうっすら色づいてきた！この調子で続けよう" };
  if (pct < 50) return { icon: "✨", text: "どんどん鮮やかに！節約の力を実感しよう" };
  if (pct < 80) return { icon: "🌟", text: "もうすぐ夢がくっきり！ゴールは近い" };
  return { icon: "🔥", text: "あと少しで夢が完全にクリアに！ラストスパート！" };
}

export function DreamView({ dream, entries, courseId, onSaveDream }: DreamViewProps) {
  const [editorOpen, setEditorOpen] = useState(false);
  // マウント／進捗変化ごとに「ロック状態 → 現在の進捗」へピントが合う演出をリプレイ
  const [revealed, setRevealed] = useState(false);

  const totalFV = totalFutureValue(entries, courseId);
  const totalFV50 = totalFutureValue50(entries, courseId);
  const progress = dream ? dreamProgress(totalFV, dream.targetAmount) : 0;
  const progressPct = Math.min(Math.round(progress * 100), 100);
  const remaining = dream ? Math.max(0, dream.targetAmount - totalFV) : 0;
  const isCompleted = progress >= 1;
  const lockIcon = isCompleted ? "🔥" : progressPct === 0 ? "🔒" : "🔓";

  useEffect(() => {
    if (!dream) return;
    setRevealed(false);
    const t = setTimeout(() => setRevealed(true), 250);
    return () => clearTimeout(t);
  }, [dream, progressPct]);

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
          {/* Dream photo：節約が進むほど「色づいて・ピントが合う」。読み込むたび演出をリプレイ */}
          <div className="relative h-52 md:h-60 overflow-hidden bg-neutral-900">
            <img
              src={dream.photoData}
              alt={dream.title}
              className="w-full h-full object-cover transition-[filter,transform] duration-[1600ms] ease-out will-change-[filter,transform]"
              style={{
                filter: revealed ? dreamFilter(progress) : DREAM_FILTER_LOCKED,
                transform: revealed ? "scale(1)" : "scale(1.08)",
              }}
            />

            {/* 現像中シマー（未達成のときだけ。動き続ける＝バグでなく演出だと分かる） */}
            {!isCompleted && (
              <div className="pointer-events-none absolute inset-0 dream-shimmer" />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/5" />

            {/* ロック／解放バッジ */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-sm px-2.5 py-1">
              <span className="text-sm leading-none">{lockIcon}</span>
              <span className="text-xs font-bold text-white tabular-nums">
                夢まで {progressPct}%
              </span>
            </div>

            {/* Edit button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20"
              onClick={() => setEditorOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* 達成演出 */}
            {isCompleted && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/55 to-black/15">
                <span className="dream-spark absolute bottom-6 left-1/4 text-2xl">✨</span>
                <span className="dream-spark absolute bottom-4 left-1/2 text-xl" style={{ animationDelay: "0.4s" }}>🔥</span>
                <span className="dream-spark absolute bottom-6 right-1/4 text-2xl" style={{ animationDelay: "0.8s" }}>✨</span>
                <div className="text-center">
                  <div className="text-5xl animate-bounce">🎉</div>
                  <p className="text-white font-extrabold text-xl mt-2 drop-shadow-lg">
                    夢、叶えられます！
                  </p>
                  <p className="text-white/90 text-sm mt-1">この調子で、その先へ🔥</p>
                </div>
              </div>
            )}

            {/* Dream info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg drop-shadow">{dream.title}</h3>
              <p className="text-white/85 text-sm drop-shadow">
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
                className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {!isCompleted && (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm leading-none">{clarityMessage(progressPct).icon}</span>
                  <span className="text-xs text-muted-foreground italic">
                    {clarityMessage(progressPct).text}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {dream.title}まであと {formatYen(remaining)}（10年後換算）
                </p>
                <p className="text-xs text-purple-500">
                  20年後換算: {formatYen(totalFV50)}
                </p>
              </div>
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
