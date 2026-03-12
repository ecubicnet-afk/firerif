"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatYen } from "@/lib/utils";
import { evaluateExpression, isExpressionString } from "@/lib/budget-utils";
import { INCOME_CATEGORIES, SAVING_CATEGORIES } from "@/lib/budget-categories";
import { Trash2, RefreshCw, Pencil, Plus } from "lucide-react";
import type { MergedEntry } from "@/hooks/use-budget";

interface Props {
  year: number;
  month: number;
  mergedIncome: MergedEntry[];
  mergedSavings: MergedEntry[];
  onAddEntry: (data: {
    year: number; month: number; day: number;
    category: string; amount: number;
    type: "INCOME" | "EXPENSE" | "SAVING";
    memo?: string;
  }) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onAddTemplate: (data: {
    id?: string;
    category: string; amount: number;
    type: "INCOME" | "EXPENSE" | "SAVING";
    day?: number; memo?: string; endDate?: string | null;
  }) => Promise<void>;
  onDeleteTemplate: (id: string) => Promise<void>;
}

function TemplateSection({
  title,
  color,
  categories,
  mergedEntries,
  year,
  month,
  type,
  onAddEntry,
  onDeleteEntry,
  onAddTemplate,
  onDeleteTemplate,
}: {
  title: string;
  color: string;
  categories: readonly string[];
  mergedEntries: MergedEntry[];
  year: number;
  month: number;
  type: "INCOME" | "SAVING";
  onAddEntry: Props["onAddEntry"];
  onDeleteEntry: Props["onDeleteEntry"];
  onAddTemplate: Props["onAddTemplate"];
  onDeleteTemplate: Props["onDeleteTemplate"];
}) {
  const [editCat, setEditCat] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null); // which specific entry is being edited
  const [editAmount, setEditAmount] = useState("");
  const [editDay, setEditDay] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const byCat: Record<string, MergedEntry[]> = {};
  for (const e of mergedEntries) {
    if (!byCat[e.category]) byCat[e.category] = [];
    byCat[e.category].push(e);
  }
  const total = mergedEntries.reduce((s, e) => s + e.amount, 0);

  // Expression support
  const isExpression = isExpressionString(editAmount);
  const evaluatedAmount = evaluateExpression(editAmount);

  function startEdit(cat: string, entry?: MergedEntry) {
    setEditCat(cat);
    setEditAmount(entry ? String(entry.amount) : "");
    setEditDay(entry ? String(entry.day) : "1");
    setEditMemo(entry?.memo || "");
    setEditingEntryId(entry ? (entry.templateId || entry.entryId || null) : null);
  }

  function startAddNew(cat: string) {
    setEditCat(cat);
    setEditAmount("");
    setEditDay("1");
    setEditMemo("");
    setEditingEntryId(null);
  }

  function cancelEdit() {
    setEditCat(null);
    setEditAmount("");
    setEditDay("");
    setEditMemo("");
    setEditingEntryId(null);
  }

  function getAmount(): number | null {
    return evaluateExpression(editAmount);
  }

  async function handleSaveTemplate(category: string) {
    const amt = getAmount();
    if (!amt || saving) return;
    setSaving(true);
    try {
      // If editing an existing template, pass its id for update
      const editingTemplate = editingEntryId
        ? mergedEntries.find(e => e.templateId === editingEntryId)
        : null;
      await onAddTemplate({
        id: editingTemplate?.templateId,
        category,
        amount: amt,
        type,
        day: parseInt(editDay) || 1,
        memo: editMemo || undefined,
      });
      cancelEdit();
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveThisMonth(category: string) {
    const amt = getAmount();
    if (!amt || saving) return;
    setSaving(true);
    try {
      await onAddEntry({
        year, month,
        day: parseInt(editDay) || 1,
        category,
        amount: amt,
        type,
        memo: editMemo || undefined,
      });
      cancelEdit();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        <p className="text-[10px] text-muted-foreground">
          「毎月に設定」で全月に反映。「今月だけ」で今月のみ変更。
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {categories.map(cat => {
            const catEntries = byCat[cat] || [];
            const catTotal = catEntries.reduce((s, e) => s + e.amount, 0);
            const isEditing = editCat === cat;
            const hasEntry = catEntries.length > 0;

            return (
              <div key={cat} className="border-b border-dashed last:border-b-0">
                <div className="flex items-center gap-2 py-2">
                  <span className="text-sm w-20 shrink-0 font-medium">{cat}</span>
                  <div className="flex-1">
                    {hasEntry ? (
                      <div className="flex flex-col gap-0.5">
                        {catEntries.map((e, i) => {
                          const eid = e.templateId || e.entryId || String(i);
                          return (
                            <div
                              key={eid}
                              className="flex items-center gap-1 text-xs cursor-pointer hover:bg-muted/30 rounded px-1 -mx-1 py-0.5 group"
                              onClick={() => {
                                if (!isEditing || editingEntryId !== eid) startEdit(cat, e);
                              }}
                            >
                              <span className="font-bold">{formatYen(e.amount)}</span>
                              {e.memo && <span className="text-muted-foreground">{e.memo}</span>}
                              {e.source === "template" ? (
                                <span className="text-[10px] text-blue-500 bg-blue-50 px-1 rounded">毎月</span>
                              ) : (
                                <span className="text-[10px] text-orange-500 bg-orange-50 px-1 rounded">今月</span>
                              )}
                              {/* Inline delete button */}
                              {e.source === "template" && e.templateId && (
                                <button
                                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 ml-auto"
                                  onClick={(ev) => { ev.stopPropagation(); onDeleteTemplate(e.templateId!); }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                              {e.source === "entry" && e.entryId && (
                                <button
                                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 ml-auto"
                                  onClick={(ev) => { ev.stopPropagation(); onDeleteEntry(e.entryId!); }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs text-muted-foreground"
                        onClick={() => startAddNew(cat)}
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
                      onClick={() => startAddNew(cat)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                  <span className="text-sm font-bold w-20 text-right shrink-0">
                    {catTotal > 0 ? formatYen(catTotal) : ""}
                  </span>
                </div>

                {isEditing && (
                  <div className="bg-muted/20 px-3 py-2 mb-1 rounded space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">金額（円）</label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          placeholder="0"
                          className="h-7 text-xs"
                          autoFocus
                        />
                        {isExpression && evaluatedAmount !== null && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            = {evaluatedAmount.toLocaleString()}円
                          </p>
                        )}
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
                          placeholder="任意"
                          className="h-7 text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      <Button
                        size="sm"
                        className="h-7 text-xs flex-1"
                        onClick={() => handleSaveTemplate(cat)}
                        disabled={saving || !evaluatedAmount}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        毎月に設定
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1"
                        onClick={() => handleSaveThisMonth(cat)}
                        disabled={saving || !evaluatedAmount}
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
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-bold">合計</span>
            <span className={`text-sm font-bold ${color}`}>{formatYen(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IncomeAndSavings({
  year, month, mergedIncome, mergedSavings,
  onAddEntry, onDeleteEntry, onAddTemplate, onDeleteTemplate,
}: Props) {
  return (
    <div className="space-y-4">
      <TemplateSection
        title="収入"
        color="text-green-600"
        categories={INCOME_CATEGORIES}
        mergedEntries={mergedIncome}
        year={year} month={month}
        type="INCOME"
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
        onAddTemplate={onAddTemplate}
        onDeleteTemplate={onDeleteTemplate}
      />
      <TemplateSection
        title="貯蓄"
        color="text-blue-600"
        categories={SAVING_CATEGORIES}
        mergedEntries={mergedSavings}
        year={year} month={month}
        type="SAVING"
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
        onAddTemplate={onAddTemplate}
        onDeleteTemplate={onDeleteTemplate}
      />
    </div>
  );
}
