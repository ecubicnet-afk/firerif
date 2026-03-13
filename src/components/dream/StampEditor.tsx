"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Plus, Trash2, RotateCcw, Pencil, Check } from "lucide-react";
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("☕");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("food");

  function startEdit(stamp: Stamp) {
    setEditingId(stamp.id!);
    setEditLabel(stamp.label);
    setEditIcon(stamp.icon);
    setEditAmount(String(stamp.amount));
    setEditCategory(stamp.categoryId);
    setAdding(false);
  }

  async function saveEdit() {
    if (!editingId || !editLabel || !editAmount) return;
    await onUpdate(editingId, {
      label: editLabel,
      icon: editIcon,
      amount: parseInt(editAmount),
      categoryId: editCategory,
    });
    setEditingId(null);
  }

  function cancelEdit() {
    setEditingId(null);
  }

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
          <p className="text-xs text-muted-foreground">
            タップで編集、ゴミ箱で削除できます
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Existing stamps */}
          {stamps.map((stamp) => (
            <div key={stamp.id}>
              {editingId === stamp.id ? (
                /* Inline edit form */
                <div className="space-y-2 p-3 rounded-lg border border-primary/30 bg-primary/5">
                  <div className="space-y-1.5">
                    <Label className="text-xs">アイコン</Label>
                    <div className="flex flex-wrap gap-1">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setEditIcon(emoji)}
                          className={`w-7 h-7 rounded text-base flex items-center justify-center ${
                            editIcon === emoji ? "bg-primary/20 ring-1 ring-primary" : "hover:bg-muted"
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
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">金額（円）</Label>
                      <Input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">カテゴリ</Label>
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setEditCategory(cat.id)}
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            editCategory === cat.id
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
                    <Button size="sm" onClick={saveEdit} disabled={!editLabel || !editAmount}>
                      <Check className="h-3.5 w-3.5 mr-1" />
                      保存
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      キャンセル
                    </Button>
                  </div>
                </div>
              ) : (
                /* Display row */
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
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
                    onClick={() => startEdit(stamp)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 h-8 w-8"
                    onClick={() => onDelete(stamp.id!)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Add new stamp */}
          {!adding ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => { setAdding(true); setEditingId(null); }}
              disabled={stamps.length >= 24}
            >
              <Plus className="h-4 w-4 mr-1" />
              スタンプを追加{stamps.length >= 24 && "（上限24個）"}
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
                      className={`w-7 h-7 rounded text-base flex items-center justify-center ${
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
