"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatYen } from "@/lib/utils";
import { FIXED_COST_CATEGORIES } from "@/lib/budget-categories";
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
  }) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

export function FixedCosts({ year, month, entries, onAddEntry, onDeleteEntry }: Props) {
  const [editCat, setEditCat] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const fixedEntries = entries.filter(e =>
    e.type === "EXPENSE" && FIXED_COST_CATEGORIES.includes(e.category as typeof FIXED_COST_CATEGORIES[number])
  );

  // Group by category
  const byCat: Record<string, BudgetEntry[]> = {};
  for (const e of fixedEntries) {
    if (!byCat[e.category]) byCat[e.category] = [];
    byCat[e.category].push(e);
  }

  const total = fixedEntries.reduce((s, e) => s + e.amount, 0);

  async function handleAdd(category: string) {
    if (!editAmount || saving) return;
    setSaving(true);
    try {
      await onAddEntry({
        year, month, day: 1,
        category,
        amount: parseInt(editAmount),
        type: "EXPENSE",
      });
      setEditCat(null);
      setEditAmount("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">固定費（毎月ほぼ決まった金額）</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {FIXED_COST_CATEGORIES.map(cat => {
            const catEntries = byCat[cat] || [];
            const catTotal = catEntries.reduce((s, e) => s + e.amount, 0);
            const isEditing = editCat === cat;

            return (
              <div key={cat} className="flex items-center gap-2 py-1.5 border-b border-dashed last:border-b-0">
                <span className="text-sm w-24 shrink-0">{cat}</span>
                <div className="flex-1 flex items-center gap-1 flex-wrap">
                  {catEntries.map(e => (
                    <div key={e.id} className="flex items-center gap-1 bg-muted rounded px-2 py-0.5 text-xs">
                      <span>{formatYen(e.amount)}</span>
                      <button onClick={() => onDeleteEntry(e.id)} className="text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAdd(cat);
                          if (e.key === "Escape") { setEditCat(null); setEditAmount(""); }
                        }}
                        placeholder="金額"
                        className="h-7 w-20 text-xs"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => handleAdd(cat)}>
                        保存
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => { setEditCat(cat); setEditAmount(""); }}
                    >
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
