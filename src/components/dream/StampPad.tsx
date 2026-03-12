"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Check, Settings } from "lucide-react";
import { formatYen } from "@/lib/utils";
import { futureValue } from "@/lib/dream-calc";
import type { Stamp, SavingsEntry, CourseId } from "@/types/dream";
import { CustomInput } from "./CustomInput";

interface StampPadProps {
  stamps: Stamp[];
  courseId: CourseId;
  onSave: (entry: Omit<SavingsEntry, "id">) => Promise<void>;
  onEditStamps: () => void;
}

export function StampPad({ stamps, courseId, onSave, onEditStamps }: StampPadProps) {
  const [tappedId, setTappedId] = useState<number | null>(null);
  const [showCustom, setShowCustom] = useState(false);

  const handleStampTap = useCallback(
    async (stamp: Stamp) => {
      if (tappedId !== null) return;
      setTappedId(stamp.id!);

      const now = new Date();
      await onSave({
        date: now.toISOString().split("T")[0],
        timestamp: Date.now(),
        amount: stamp.amount,
        categoryId: stamp.categoryId,
        stampId: stamp.id!,
        label: stamp.label,
        icon: stamp.icon,
      });

      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(50);

      setTimeout(() => setTappedId(null), 600);
    },
    [onSave, tappedId]
  );

  const handleCustomSave = useCallback(
    async (amount: number, categoryId: string, categoryLabel: string, categoryIcon: string) => {
      const now = new Date();
      await onSave({
        date: now.toISOString().split("T")[0],
        timestamp: Date.now(),
        amount,
        categoryId,
        stampId: null,
        label: categoryLabel,
        icon: categoryIcon,
      });
      setShowCustom(false);
    },
    [onSave]
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">節約を記録</CardTitle>
          <Button variant="ghost" size="icon" onClick={onEditStamps}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          ワンタップで記録。未来の自分に仕送りしよう！
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {stamps.map((stamp) => {
            const isTapped = tappedId === stamp.id;
            const fv = futureValue(stamp.amount, courseId);
            return (
              <button
                key={stamp.id}
                onClick={() => handleStampTap(stamp)}
                disabled={tappedId !== null}
                className={`
                  relative flex flex-col items-center gap-1 rounded-xl border-2 p-3
                  transition-all duration-200 active:scale-95
                  ${isTapped
                    ? "border-primary bg-primary/10 scale-95"
                    : "border-border hover:border-primary/50 hover:bg-accent"
                  }
                `}
              >
                {isTapped && (
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-xl">
                    <Check className="h-8 w-8 text-primary animate-bounce" />
                  </div>
                )}
                <span className="text-2xl">{stamp.icon}</span>
                <span className="text-xs font-medium">{stamp.label}</span>
                <span className="text-sm font-bold">{formatYen(stamp.amount)}</span>
                <span className="text-[10px] text-red-500 font-bold">
                  → 20年後 {formatYen(fv)}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => setShowCustom(true)}
            className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border p-3 hover:border-primary/50 hover:bg-accent transition-colors"
          >
            <Plus className="h-6 w-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">カスタム金額</span>
          </button>
        </div>

        {showCustom && (
          <CustomInput
            onSave={handleCustomSave}
            onCancel={() => setShowCustom(false)}
          />
        )}
      </CardContent>
    </Card>
  );
}
