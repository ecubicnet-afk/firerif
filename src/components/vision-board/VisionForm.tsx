"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Image as ImageIcon, Link, Loader2 } from "lucide-react";

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

// Canvas-based image compression: resizes to maxWidth and outputs JPEG
function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export function VisionForm({ onSubmit, onCancel }: VisionFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [imageMode, setImageMode] = useState<"drop" | "url">("drop");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileToBase64 = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("10MB以下の画像を選択してください");
      return;
    }
    setCompressing(true);
    try {
      let compressed = await compressImage(file, 1200, 0.8);
      // Check if compressed size exceeds ~2MB (Base64 is ~33% larger than binary)
      if (compressed.length * 0.75 > 2 * 1024 * 1024) {
        compressed = await compressImage(file, 1200, 0.5);
      }
      setImageUrl(compressed);
    } catch {
      alert("画像の処理に失敗しました");
    } finally {
      setCompressing(false);
    }
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
      className="rounded-lg bg-[#faf6f0] dark:bg-[#3a3530] border border-[#e8dcc8] dark:border-[#554e44] shadow-xl overflow-hidden bg-paper"
    >
      <div className="p-6">
        <h3 className="text-lg font-bold text-amber-900 dark:text-amber-200 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white text-sm">
            +
          </span>
          新しいビジョン
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="v-title" className="text-xs font-bold text-amber-800 dark:text-amber-300">
              タイトル
            </Label>
            <Input
              id="v-title"
              placeholder="例: 海外でのんびり暮らす"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-white/80 dark:bg-white/5 border-[#d4c4a8] dark:border-[#554e44] focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="v-desc" className="text-xs font-bold text-amber-800 dark:text-amber-300">
              詳細
            </Label>
            <Textarea
              id="v-desc"
              placeholder="具体的なイメージを書いてください"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="bg-white/80 dark:bg-white/5 border-[#d4c4a8] dark:border-[#554e44] focus:border-amber-500 transition-colors resize-none"
            />
          </div>

          {/* Image upload area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-amber-800 dark:text-amber-300">画像</Label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setImageMode("drop")}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    imageMode === "drop"
                      ? "bg-amber-600/20 text-amber-800 dark:text-amber-300"
                      : "text-amber-600/50 hover:text-amber-700"
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
                      ? "bg-amber-600/20 text-amber-800 dark:text-amber-300"
                      : "text-amber-600/50 hover:text-amber-700"
                  }`}
                >
                  <Link className="w-3 h-3 inline mr-0.5" />
                  URL
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {compressing ? (
                <motion.div
                  key="compressing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-700 p-8 text-center"
                >
                  <Loader2 className="w-8 h-8 mx-auto mb-2 text-amber-500 animate-spin" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">画像を圧縮中...</p>
                </motion.div>
              ) : hasPreview ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="relative rounded-lg overflow-hidden aspect-video"
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
                    cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all
                    ${dragOver
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-500/10"
                      : "border-[#d4c4a8] dark:border-[#554e44] hover:border-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-900/10"
                    }
                  `}
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-amber-400" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    ドラッグ&ドロップ または クリックして画像を選択
                  </p>
                  <p className="text-[10px] text-amber-500/70 mt-1">JPG, PNG (10MBまで・自動圧縮)</p>
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
                    className="bg-white/80 dark:bg-white/5 border-[#d4c4a8] dark:border-[#554e44]"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Date & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-date" className="text-xs font-bold text-amber-800 dark:text-amber-300">
                目標日
              </Label>
              <Input
                id="v-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="bg-white/80 dark:bg-white/5 border-[#d4c4a8] dark:border-[#554e44]"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="v-amount" className="text-xs font-bold text-amber-800 dark:text-amber-300">
                目標金額（円）
              </Label>
              <Input
                id="v-amount"
                type="number"
                placeholder="0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="bg-white/80 dark:bg-white/5 border-[#d4c4a8] dark:border-[#554e44]"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={loading || !title || compressing}
              className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white shadow-lg shadow-amber-700/20"
            >
              {loading ? "保存中..." : "ピン留めする"}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel} className="text-amber-700 dark:text-amber-400">
              キャンセル
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
