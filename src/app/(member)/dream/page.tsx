"use client";

import { useState } from "react";
import { useSavings } from "@/hooks/use-savings";
import { useDream } from "@/hooks/use-dream";
import { useStamps } from "@/hooks/use-stamps";
import { usePreferences } from "@/hooks/use-preferences";
import { DreamView } from "@/components/dream/DreamView";
import { StampPad } from "@/components/dream/StampPad";
import { Ledger } from "@/components/dream/Ledger";
import { StampEditor } from "@/components/dream/StampEditor";
import { Sparkles } from "lucide-react";

export default function DreamPage() {
  const { entries, addEntry, deleteEntry, loading: savingsLoading } = useSavings();
  const { dream, saveDream, loading: dreamLoading } = useDream();
  const {
    stamps,
    addStamp,
    updateStamp,
    deleteStamp,
    resetDefaults,
    loading: stampsLoading,
  } = useStamps();
  const { courseId, viewMode, setCourse, setViewMode } = usePreferences();
  const [stampEditorOpen, setStampEditorOpen] = useState(false);

  const isLoading = savingsLoading || dreamLoading || stampsLoading;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Sparkles className="h-8 w-8 text-primary mx-auto animate-pulse" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <h1 className="text-2xl font-bold">節約ドリーム</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          今日の節約が、10年後の夢のチケットに変わる
        </p>
      </div>

      {/* はじめての方へ：3ステップの使い方 */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs font-bold text-primary mb-2">はじめての方へ・使い方</p>
        <ol className="grid grid-cols-3 gap-2 text-center">
          <li className="space-y-1">
            <div className="text-xl">🎯</div>
            <p className="text-xs font-semibold">①夢を決める</p>
            <p className="text-[11px] text-muted-foreground leading-tight">叶えたい夢と金額</p>
          </li>
          <li className="space-y-1">
            <div className="text-xl">👆</div>
            <p className="text-xs font-semibold">②節約をタップ</p>
            <p className="text-[11px] text-muted-foreground leading-tight">我慢できた日に記録</p>
          </li>
          <li className="space-y-1">
            <div className="text-xl">📈</div>
            <p className="text-xs font-semibold">③未来が増える</p>
            <p className="text-[11px] text-muted-foreground leading-tight">投資で10年後いくら？</p>
          </li>
        </ol>
      </div>

      <DreamView
        dream={dream}
        entries={entries}
        courseId={courseId}
        onSaveDream={saveDream}
      />

      <StampPad
        stamps={stamps}
        courseId={courseId}
        onSave={addEntry}
        onEditStamps={() => setStampEditorOpen(true)}
      />

      <Ledger
        entries={entries}
        courseId={courseId}
        viewMode={viewMode}
        onCourseChange={setCourse}
        onViewModeChange={setViewMode}
        onDeleteEntry={deleteEntry}
      />

      {stampEditorOpen && (
        <StampEditor
          stamps={stamps}
          onUpdate={updateStamp}
          onAdd={addStamp}
          onDelete={deleteStamp}
          onResetDefaults={resetDefaults}
          onClose={() => setStampEditorOpen(false)}
        />
      )}
    </div>
  );
}
