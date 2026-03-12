"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatYen } from "@/lib/utils";
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

export function SpecialExpenses({ year, month, entries, onAddEntry, onDeleteEntry }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [formDay, setFormDay] = useState(new Date().getDate().toString());
  const [formMemo, setFormMemo] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const specialEntries = entries.filter(e =>
    e.type === "EXPENSE" && e.category === "特別出費"
  );
  const total = specialEntries.reduce((s, e) => s + e.amount, 0);

  async function handleAdd() {
    if (!formAmount || saving) return;
    setSaving(true);
    try {
      await onAddEntry({
        year, month,
        day: parseInt(formDay) || 1,
        category: "特別出費",
        amount: parseInt(formAmount),
        type: "EXPENSE",
        memo: formMemo || undefined,
      });
      setFormDay(new Date().getDate().toString());
      setFormMemo("");
      setFormAmount("");
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">特別出費</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            追加
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="flex gap-2 mb-3 p-2 rounded-lg border">
            <Input
              type="number"
              value={formDay}
              onChange={(e) => setFormDay(e.target.value)}
              placeholder="日"
              className="h-8 w-12 text-xs"
            />
            <Input
              value={formMemo}
              onChange={(e) => setFormMemo(e.target.value)}
              placeholder="内容"
              className="h-8 flex-1 text-xs"
            />
            <Input
              type="number"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
              placeholder="金額"
              className="h-8 w-24 text-xs"
            />
            <Button size="sm" className="h-8 text-xs" onClick={handleAdd} disabled={!formAmount}>
              保存
            </Button>
          </div>
        )}

        {specialEntries.length > 0 ? (
          <div className="space-y-1">
            {specialEntries.map(e => (
              <div key={e.id} className="flex items-center gap-2 py-1 border-b border-dashed last:border-b-0 text-sm">
                <span className="text-muted-foreground w-10 text-xs">{month}/{e.day || 1}</span>
                <span className="flex-1 truncate">{e.memo || "特別出費"}</span>
                <span className="font-bold">{formatYen(e.amount)}</span>
                <button onClick={() => onDeleteEntry(e.id)} className="text-muted-foreground hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-bold">合計</span>
              <span className="text-sm font-bold text-purple-600">{formatYen(total)}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-3">特別出費はまだありません</p>
        )}
      </CardContent>
    </Card>
  );
}
