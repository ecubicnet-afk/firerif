"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatYen } from "@/lib/utils";
import { INCOME_CATEGORIES, SAVING_CATEGORIES } from "@/lib/budget-categories";
import { Trash2, Plus } from "lucide-react";
import type { BudgetEntry } from "@/hooks/use-budget";

interface Props {
  year: number;
  month: number;
  entries: BudgetEntry[];
  onAddEntry: (data: {
    year: number; month: number; day: number;
    category: string; amount: number;
    type: "INCOME" | "EXPENSE" | "SAVING";
    memo?: string;
  }) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

function EntrySection({
  title,
  color,
  categories,
  entries,
  year,
  month,
  type,
  onAdd,
  onDelete,
}: {
  title: string;
  color: string;
  categories: readonly string[];
  entries: BudgetEntry[];
  year: number;
  month: number;
  type: "INCOME" | "SAVING";
  onAdd: Props["onAddEntry"];
  onDelete: Props["onDeleteEntry"];
}) {
  const [editCat, setEditCat] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const byCat: Record<string, BudgetEntry[]> = {};
  for (const e of entries.filter(e => e.type === type)) {
    if (!byCat[e.category]) byCat[e.category] = [];
    byCat[e.category].push(e);
  }
  const total = entries.filter(e => e.type === type).reduce((s, e) => s + e.amount, 0);

  async function handleAdd(category: string) {
    if (!editAmount || saving) return;
    setSaving(true);
    try {
      await onAdd({
        year, month, day: 1,
        category,
        amount: parseInt(editAmount),
        type,
        memo: editMemo || undefined,
      });
      setEditCat(null);
      setEditAmount("");
      setEditMemo("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {categories.map(cat => {
            const catEntries = byCat[cat] || [];
            const catTotal = catEntries.reduce((s, e) => s + e.amount, 0);
            const isEditing = editCat === cat;
            return (
              <div key={cat} className="flex items-center gap-2 py-1.5 border-b border-dashed last:border-b-0">
                <span className="text-sm w-20 shrink-0">{cat}</span>
                <div className="flex-1 flex items-center gap-1 flex-wrap">
                  {catEntries.map(e => (
                    <div key={e.id} className="flex items-center gap-1 bg-muted rounded px-2 py-0.5 text-xs">
                      <span>{formatYen(e.amount)}</span>
                      {e.memo && <span className="text-muted-foreground">({e.memo})</span>}
                      <button onClick={() => onDelete(e.id)} className="text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Input type="number" value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleAdd(cat); if (e.key === "Escape") setEditCat(null); }}
                        placeholder="金額" className="h-7 w-20 text-xs" autoFocus />
                      <Input value={editMemo}
                        onChange={(e) => setEditMemo(e.target.value)}
                        placeholder="メモ" className="h-7 w-20 text-xs" />
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => handleAdd(cat)}>保存</Button>
                    </div>
                  ) : (
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditCat(cat)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <span className="text-sm font-bold w-20 text-right shrink-0">
                  {catTotal > 0 ? formatYen(catTotal) : ""}
                </span>
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

export function IncomeAndSavings({ year, month, entries, onAddEntry, onDeleteEntry }: Props) {
  return (
    <div className="space-y-4">
      <EntrySection
        title="収入"
        color="text-green-600"
        categories={INCOME_CATEGORIES}
        entries={entries}
        year={year} month={month}
        type="INCOME"
        onAdd={onAddEntry}
        onDelete={onDeleteEntry}
      />
      <EntrySection
        title="貯蓄"
        color="text-blue-600"
        categories={SAVING_CATEGORIES}
        entries={entries}
        year={year} month={month}
        type="SAVING"
        onAdd={onAddEntry}
        onDelete={onDeleteEntry}
      />
    </div>
  );
}
