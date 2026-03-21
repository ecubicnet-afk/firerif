"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, X, ImageIcon } from "lucide-react";
import type { DreamGoal } from "@/types/dream";

interface DreamEditorProps {
  dream: DreamGoal | null;
  onSave: (data: { title: string; targetAmount: number; photoData: string }) => Promise<void>;
  onClose: () => void;
}

function resizeImage(file: File, maxWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function DreamEditor({ dream, onSave, onClose }: DreamEditorProps) {
  const [title, setTitle] = useState(dream?.title ?? "");
  const [amount, setAmount] = useState(dream?.targetAmount?.toString() ?? "");
  const [photoData, setPhotoData] = useState(dream?.photoData ?? "");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await resizeImage(file, 800);
    setPhotoData(data);
    e.target.value = "";
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title || !amount || !photoData) return;
      setSaving(true);
      await onSave({ title, targetAmount: parseInt(amount), photoData });
      setSaving(false);
    },
    [title, amount, photoData, onSave]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {dream ? "夢を編集" : "夢を設定"}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo upload */}
            <div className="space-y-2">
              <Label>写真</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
              {photoData ? (
                <div
                  className="relative h-40 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => fileRef.current?.click()}
                >
                  <img src={photoData} alt="Dream" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-40 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:bg-muted transition-colors"
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    夢の写真をアップロード
                  </span>
                </button>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="dream-title">夢のタイトル</Label>
              <Input
                id="dream-title"
                placeholder="例：ハワイ旅行"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Target amount */}
            <div className="space-y-2">
              <Label htmlFor="dream-amount">目標金額（円）</Label>
              <Input
                id="dream-amount"
                type="number"
                placeholder="例：500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={1}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={saving || !title || !amount || !photoData}
              >
                {saving ? "保存中..." : "保存"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
