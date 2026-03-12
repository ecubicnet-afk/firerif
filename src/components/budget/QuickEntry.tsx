"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, ImageIcon, Plus } from "lucide-react";
import {
  LIVING_EXPENSE_CATEGORIES,
  FIXED_COST_CATEGORIES,
  SPECIAL_EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  SAVING_CATEGORIES,
} from "@/lib/budget-categories";

type EntryType = "INCOME" | "EXPENSE" | "SAVING";
type ExpenseSubGroup = "生活費" | "固定費" | "特別出費";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  INCOME: { label: "収入", color: "text-green-600" },
  EXPENSE: { label: "支出", color: "text-red-600" },
  SAVING: { label: "貯蓄", color: "text-blue-600" },
};

const EXPENSE_SUBGROUPS: { key: ExpenseSubGroup; cats: readonly string[] }[] = [
  { key: "生活費", cats: LIVING_EXPENSE_CATEGORIES },
  { key: "固定費", cats: FIXED_COST_CATEGORIES },
  { key: "特別出費", cats: SPECIAL_EXPENSE_CATEGORIES },
];

interface Props {
  year: number;
  month: number;
  onAddEntry: (data: {
    year: number; month: number; day: number;
    category: string; amount: number;
    type: EntryType;
    memo?: string;
    imageData?: string | null;
  }) => Promise<void>;
  onClose: () => void;
}

export function QuickEntry({ year, month, onAddEntry, onClose }: Props) {
  const [type, setType] = useState<EntryType>("EXPENSE");
  const [subGroup, setSubGroup] = useState<ExpenseSubGroup>("生活費");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const today = new Date();
  const [formDate, setFormDate] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );

  // Get current category list
  function getCats(): readonly string[] {
    if (type === "INCOME") return INCOME_CATEGORIES;
    if (type === "SAVING") return SAVING_CATEGORIES;
    return EXPENSE_SUBGROUPS.find(g => g.key === subGroup)?.cats || [];
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("画像は2MB以下にしてください"); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !amount || saving) return;
    setSaving(true);
    try {
      const parts = formDate.split("-").map(Number);
      await onAddEntry({
        year: parts[0], month: parts[1], day: parts[2],
        category,
        amount: parseInt(amount),
        type,
        memo: memo || undefined,
        imageData: image,
      });
      setCategory(""); setAmount(""); setMemo(""); setImage(null);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50" onClick={onClose}>
      <Card className="w-full max-w-lg mx-auto md:mx-4 rounded-t-2xl md:rounded-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">新しい記録</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Type selector */}
            <div className="flex gap-1.5">
              {(["EXPENSE", "INCOME", "SAVING"] as const).map(t => (
                <Button key={t} type="button" size="sm"
                  variant={type === t ? "default" : "outline"}
                  className="flex-1 text-xs"
                  onClick={() => { setType(t); setCategory(""); }}>
                  {TYPE_LABELS[t].label}
                </Button>
              ))}
            </div>

            {/* Expense sub-group selector */}
            {type === "EXPENSE" && (
              <div className="flex gap-1">
                {EXPENSE_SUBGROUPS.map(g => (
                  <Badge
                    key={g.key}
                    variant={subGroup === g.key ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => { setSubGroup(g.key); setCategory(""); }}
                  >
                    {g.key}
                  </Badge>
                ))}
              </div>
            )}

            {/* Category buttons */}
            <div className="flex flex-wrap gap-1.5">
              {getCats().map(cat => (
                <Button key={cat} type="button" size="sm"
                  variant={category === cat ? "default" : "outline"}
                  className="text-xs h-7"
                  onClick={() => setCategory(cat)}>
                  {cat}
                </Button>
              ))}
            </div>

            {/* Date + Amount + Memo */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-[10px]">日付</Label>
                <Input type="date" value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[10px]">金額（円）</Label>
                <Input type="number" placeholder="0" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-8 text-xs" required />
              </div>
              <div>
                <Label className="text-[10px]">メモ</Label>
                <Input placeholder="任意" value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="h-8 text-xs" />
              </div>
            </div>

            {/* Image */}
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border hover:bg-accent transition-colors">
                <ImageIcon className="h-3.5 w-3.5" />
                画像
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {image && (
                <div className="relative">
                  <img src={image} alt="" className="h-10 w-10 object-cover rounded" />
                  <button type="button" onClick={() => setImage(null)}
                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={saving || !category || !amount}>
              {saving ? "保存中..." : "保存する"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
