"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Image as ImageIcon, Link } from "lucide-react";

interface VisionFormProps {
  onSubmit: (data: {
    title: string;
    description: string | null;
    imageUrl: string | null;
    targetDate: string | null;
    targetAmount: number | null;
  }) => Promise<void>;
  onCancel: () => void;
}

export function VisionForm({ onSubmit, onCancel }: VisionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState<"drop" | "url">("drop");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileToBase64 = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    // Limit to ~2MB for base64 storage
    if (file.size > 2 * 1024 * 1024) {
      alert("2MB以下の画像を選択してください");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) setImageUrl(result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileToBase64(file);
    },
    [handleFileToBase64]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileToBase64(file);
    },
    [handleFileToBase64]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title) return;
    setLoading(true);
    try {
      await onSubmit({
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        targetDate: targetDate || null,
        targetAmount: targetAmount ? parseInt(targetAmount) : null,
      });
    } finally {
      setLoading(false);
    }
  }

  const hasPreview = imageUrl && (imageUrl.startsWith("data:") || imageUrl.startsWith("http"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden"
    >
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm">
            +
          </span>
          新しいビジョン
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="v-title" className="text-xs font-bold text-slate-600 dark:text-slate-300">
              タイトル
            </Label>
            <Input
              id="v-title"
              placeholder="例: 海外でのんびり暮らす"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-white/50 dark:bg-white/5 border-white/30 focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="v-desc" className="text-xs font-bold text-slate-600 dark:text-slate-300">
              詳細
            </Label>
            <Textarea
              id="v-desc"
              placeholder="具体的なイメージを書いてください"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-white/50 dark:bg-white/5 border-white/30 focus:border-amber-400 transition-colors resize-none"
            />
          </div>

          {/* Image upload area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-600 dark:text-slate-300">画像</Label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setImageMode("drop")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    imageMode === "drop"
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-400"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Upload className="w-3 h-3 inline mr-0.5" />
                  アップロード
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    imageMode === "url"
                      ? "bg-blue-500/20 text-blue-700 dark:text-blue-400"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Link className="w-3 h-3 inline mr-0.5" />
                  URL
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {hasPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative rounded-xl overflow-hidden aspect-video"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="プレビュー"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : imageMode === "drop" ? (
                <motion.div
                  key="drop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all
                    ${dragOver
                      ? "border-amber-400 bg-amber-50/50 dark:bg-amber-500/10"
                      : "border-white/30 hover:border-amber-300 hover:bg-white/5"
                    }
                  `}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ドラッグ&ドロップ または クリックして画像を選択
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">JPG, PNG (2MBまで)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </motion.div>
              ) : (
                <motion.div key="url" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Input
                    placeholder="https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="bg-white/50 dark:bg-white/5 border-white/30"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-date" className="text-xs font-bold text-slate-600 dark:text-slate-300">
                目標日
              </Label>
              <Input
                id="v-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-white/50 dark:bg-white/5 border-white/30"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-amount" className="text-xs font-bold text-slate-600 dark:text-slate-300">
                目標金額（円）
              </Label>
              <Input
                id="v-amount"
                type="number"
                placeholder="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="bg-white/50 dark:bg-white/5 border-white/30"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading || !title}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20"
            >
              {loading ? "保存中..." : "保存"}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel} className="text-slate-500">
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
