"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2, RotateCcw } from "lucide-react";
import { CATEGORIES } from "@/lib/dream-constants";
import type { Stamp } from "@/types/dream";

const EMOJI_OPTIONS = [
  "☕", "🍺", "🍱", "🚕", "🛍️", "🎮", "🍰", "🍕", "🍜", "🧋",
  "🎬", "📱", "💄", "👟", "🧴", "🍫", "🥤", "🎠", "🚗", "✈️",
  "💊", "📚", "🏋️", "🎵", "🎯", "💰", "🏠", "👔", "🧹", "🌟",
];

interface StampEditorProps {
  stamps: Stamp[];
  onUpdate: (id: number, data: Partial<Stamp>) => Promise<void>;
  onAdd: (stamp: Omit<Stamp, "id">) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onResetDefaults: () => Promise<void>;
  onClose: () => void;
}

export function StampEditor({
  stamps,
  onUpdate,
  onAdd,
  onDelete,
  onResetDefaults,
  onClose,
}: StampEditorProps) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("☕");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("food");

  async function handleAdd() {
    if (!newLabel || !newAmount) return;
    await onAdd({
      label: newLabel,
      icon: newIcon,
      amount: parseInt(newAmount),
      categoryId: newCategory,
      sortOrder: stamps.length,
      isDefault: false,
    });
    setAdding(false);
    setNewLabel("");
    setNewAmount("");
    setNewIcon("☕");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">スタンプ編集</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Existing stamps */}
          {stamps.map((stamp) => (
            <div key={stamp.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <span className="text-xl">{stamp.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{stamp.label}</p>
                <p className="text-xs text-muted-foreground">
                  {stamp.amount.toLocaleString()}円
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={() => onDelete(stamp.id!)}
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}

          {/* Add new stamp */}
          {!adding ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setAdding(true)}
              disabled={stamps.length >= 12}
            >
              <Plus className="h-4 w-4 mr-1" />
              スタンプを追加
            </Button>
          ) : (
            <div className="space-y-3 p-3 rounded-lg border">
              <div className="space-y-1.5">
                <Label className="text-xs">アイコン</Label>
                <div className="flex flex-wrap gap-1">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewIcon(emoji)}
                      className={`w-8 h-8 rounded text-lg flex items-center justify-center ${
                        newIcon === emoji ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-muted"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">ラベル</Label>
                  <Input
                    placeholder="例：カフェ我慢"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">金額（円）</Label>
                  <Input
                    type="number"
                    placeholder="400"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">カテゴリ</Label>
                <div className="flex flex-wrap gap-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setNewCategory(cat.id)}
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        newCategory === cat.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={handleAdd} disabled={!newLabel || !newAmount}>
                  追加
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAdding(false)}>
                  キャンセル
                </Button>
              </div>
            </div>
          )}

          {/* Reset defaults */}
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onResetDefaults}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            デフォルトに戻す
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
