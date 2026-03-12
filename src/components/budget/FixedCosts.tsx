"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatYen } from "@/lib/utils";
import { FIXED_COST_CATEGORIES } from "@/lib/budget-categories";
import { Trash2, RefreshCw, Pencil, Plus } from "lucide-react";
import type { MergedEntry } from "@/hooks/use-budget";

function formatEndDate(endDate: string | null | undefined, currentYear: number, currentMonth: number): string | null {
  if (!endDate) return null;
  const d = new Date(endDate);
  const endY = d.getFullYear();
  const endM = d.getMonth() + 1;
  const remaining = (endY - currentYear) * 12 + (endM - currentMonth);
  const label = `〜${endY}年${endM}月`;
  if (remaining > 0) return `${label} (残り${remaining}回)`;
  if (remaining === 0) return `${label} (今月で完了)`;
  return `${label} (期限超過)`;
}

interface Props {
  year: number;
  month: number;
  mergedEntries: MergedEntry[];
  onAddEntry: (data: {
    year: number; month: number; day: number;
    category: string; amount: number;
    type: "INCOME" | "EXPENSE" | "SAVING";
    memo?: string;
  }) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onAddTemplate: (data: {
    category: string; amount: number;
    type: "INCOME" | "EXPENSE" | "SAVING";
    day?: number; memo?: string; endDate?: string | null;
  }) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
}

export function FixedCosts({ year, month, mergedEntries, onAddEntry, onDeleteEntry, onAddTemplate, onDeleteTemplate }: Props) {
  const [editCat, setEditCat] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDay, setEditDay] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  // Group merged entries by category
  const byCat: Record<string, MergedEntry[]> = {};
  for (const e of mergedEntries) {
    if (!byCat[e.category]) byCat[e.category] = [];
    byCat[e.category].push(e);
  }

  const total = mergedEntries.reduce((s, e) => s + e.amount, 0);

  function startEdit(cat: string, entry?: MergedEntry) {
    setEditCat(cat);
    setEditAmount(entry ? String(entry.amount) : "");
    setEditDay(entry ? String(entry.day) : "1");
    setEditMemo(entry?.memo || "");
    if (entry?.endDate) {
      const d = new Date(entry.endDate);
      setEditEndDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    } else {
      setEditEndDate("");
    }
  }

  function cancelEdit() {
    setEditCat(null);
    setEditAmount("");
    setEditDay("");
    setEditMemo("");
    setEditEndDate("");
  }

  async function handleSaveTemplate(category: string) {
    if (!editAmount || saving) return;
    setSaving(true);
    try {
      await onAddTemplate({
        category,
        amount: parseInt(editAmount),
        type: "EXPENSE",
        day: parseInt(editDay) || 1,
        memo: editMemo || undefined,
        endDate: editEndDate ? `${editEndDate}-01` : null,
      });
      cancelEdit();
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveThisMonth(category: string) {
    if (!editAmount || saving) return;
    setSaving(true);
    try {
      await onAddEntry({
        year, month,
        day: parseInt(editDay) || 1,
        category,
        amount: parseInt(editAmount),
        type: "EXPENSE",
        memo: editMemo || undefined,
      });
      cancelEdit();
    } finally {
      setSaving(false);
    }
  }

  async function handleRevertToTemplate(entryId: string) {
    await onDeleteEntry(entryId);
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">固定費（毎月ほぼ決まった金額）</CardTitle>
        <p className="text-[10px] text-muted-foreground">
          「毎月に設定」で全月に反映。「今月だけ」で今月のみ変更。
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {FIXED_COST_CATEGORIES.map(cat => {
            const catEntries = byCat[cat] || [];
            const catTotal = catEntries.reduce((s, e) => s + e.amount, 0);
            const isEditing = editCat === cat;
            const hasEntry = catEntries.length > 0;

            return (
              <div key={cat} className="border-b border-dashed last:border-b-0">
                <div
                  className={`flex items-center gap-2 py-2 ${!isEditing && hasEntry ? "cursor-pointer hover:bg-muted/30" : ""}`}
                  onClick={() => {
                    if (!isEditing && hasEntry) {
                      startEdit(cat, catEntries[0]);
                    }
                  }}
                >
                  <span className="text-sm w-20 shrink-0 font-medium">{cat}</span>
                  <div className="flex-1">
                    {hasEntry ? (
                      <div className="flex items-center gap-2 text-xs">
                        {catEntries.map((e, i) => (
                          <div key={i} className="flex items-center gap-1 flex-wrap">
                            <span className="font-bold">{formatYen(e.amount)}</span>
                            {e.memo && <span className="text-muted-foreground">{e.memo}</span>}
                            {e.endDate && (
                              <span className="text-[10px] text-green-600 bg-green-50 px-1 rounded">
                                {formatEndDate(e.endDate, year, month)}
                              </span>
                            )}
                            {e.source === "template" ? (
                              <span className="text-[10px] text-blue-500 bg-blue-50 px-1 rounded">毎月</span>
                            ) : (
                              <span className="text-[10px] text-orange-500 bg-orange-50 px-1 rounded">今月</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs text-muted-foreground"
                        onClick={(e) => { e.stopPropagation(); startEdit(cat); }}
                      >
                        + 設定する
                      </Button>
                    )}
                  </div>
                  {hasEntry && !isEditing && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={(e) => { e.stopPropagation(); startEdit(cat); }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                  <span className="text-sm font-bold w-20 text-right shrink-0">
                    {catTotal > 0 ? formatYen(catTotal) : ""}
                  </span>
                </div>

                {/* Edit panel */}
                {isEditing && (
                  <div className="bg-muted/20 px-3 py-2 mb-1 rounded space-y-2">
                    <div className={`grid gap-2 ${cat === "ローン返済" ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
                      <div>
                        <label className="text-[10px] text-muted-foreground">金額（円）</label>
                        <Input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder="0"
                          className="h-7 text-xs"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">支払日</label>
                        <Input
                          type="number"
                          value={editDay}
                          onChange={(e) => setEditDay(e.target.value)}
                          placeholder="1"
                          min={1} max={31}
                          className="h-7 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">メモ</label>
                        <Input
                          value={editMemo}
                          onChange={(e) => setEditMemo(e.target.value)}
                          placeholder={cat === "ローン返済" ? "住宅ローン等" : "任意"}
                          className="h-7 text-xs"
                        />
                      </div>
                      {cat === "ローン返済" && (
                        <div>
                          <label className="text-[10px] text-muted-foreground">返済期限（任意）</label>
                          <Input
                            type="month"
                            value={editEndDate}
                            onChange={(e) => setEditEndDate(e.target.value)}
                            className="h-7 text-xs"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <Button
                        size="sm"
                        className="h-7 text-xs flex-1"
                        onClick={() => handleSaveTemplate(cat)}
                        disabled={saving || !editAmount}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        毎月に設定
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1"
                        onClick={() => handleSaveThisMonth(cat)}
                        disabled={saving || !editAmount}
                      >
                        <Pencil className="h-3 w-3 mr-1" />
                        今月だけ
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={cancelEdit}
                      >
                        キャンセル
                      </Button>
                    </div>
                    {/* Actions for existing entries */}
                    {catEntries.length > 0 && (
                      <div className="flex gap-1.5 pt-1 border-t border-dashed">
                        {catEntries[0].source === "entry" && catEntries[0].entryId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs text-blue-500"
                            onClick={() => handleRevertToTemplate(catEntries[0].entryId!)}
                          >
                            テンプレートに戻す
                          </Button>
                        )}
                        {catEntries[0].source === "template" && catEntries[0].templateId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs text-red-500"
                            onClick={() => onDeleteTemplate(catEntries[0].templateId!)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            毎月設定を削除
                          </Button>
                        )}
                        {catEntries[0].source === "entry" && catEntries[0].entryId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs text-red-500"
                            onClick={() => onDeleteEntry(catEntries[0].entryId!)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            削除
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-bold">合計</span>
            <span className="text-sm font-bold text-blue-600">{formatYen(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
