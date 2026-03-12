"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatYen } from "@/lib/utils";
import { FIXED_COST_CATEGORIES } from "@/lib/budget-categories";
import { Trash2 } from "lucide-react";
import type { BudgetEntry } from "@/hooks/use-budget";

interface Props {
  year: number;
  month: number;
  entries: BudgetEntry[];
  onDeleteEntry: (id: string) => Promise<void>;
}

export function FixedCosts({ year, month, entries, onDeleteEntry }: Props) {
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">固定費（毎月ほぼ決まった金額）</CardTitle>
        <p className="text-[10px] text-muted-foreground">概要タブから記録できます</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {FIXED_COST_CATEGORIES.map(cat => {
            const catEntries = byCat[cat] || [];
            const catTotal = catEntries.reduce((s, e) => s + e.amount, 0);

            return (
              <div key={cat} className="py-1.5 border-b border-dashed last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm w-20 shrink-0 font-medium">{cat}</span>
                  <div className="flex-1">
                    {catEntries.length > 0 ? (
                      <div className="space-y-0.5">
                        {catEntries.map(e => (
                          <div key={e.id} className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground w-10 shrink-0">{month}/{e.day}</span>
                            <span className="font-bold">{formatYen(e.amount)}</span>
                            {e.memo && (
                              <span className="text-muted-foreground truncate">{e.memo}</span>
                            )}
                            {e.imageData && (
                              <img src={e.imageData} alt="" className="h-5 w-5 object-cover rounded shrink-0" />
                            )}
                            <button
                              onClick={() => onDeleteEntry(e.id)}
                              className="ml-auto shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">(未登録)</span>
                    )}
                  </div>
                  <span className="text-sm font-bold w-20 text-right shrink-0">
                    {catTotal > 0 ? formatYen(catTotal) : ""}
                  </span>
                </div>
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
