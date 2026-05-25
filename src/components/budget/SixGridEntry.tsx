"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";
import {
  SIX_GRID_CELLS,
  COST_TYPE_CONFIG,
  PAY_METHOD_CONFIG,
} from "@/lib/budget-categories";
import type { CostType, PayMethod } from "@/lib/budget-categories";
import type { BudgetEntry } from "@/hooks/use-budget";

interface GridTotalCell {
  costType: CostType;
  payMethod: PayMethod;
  label: string;
  num: number;
  amount: number;
  entries: BudgetEntry[];
}

interface Props {
  year: number;
  month: number;
  gridTotals: GridTotalCell[];
  onAddEntry: (data: {
    year: number; month: number; day: number;
    category: string; amount: number;
    type: "EXPENSE";
    costType: CostType; payMethod: PayMethod;
    memo?: string;
  }) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
}

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export function SixGridEntry({ year, month, gridTotals, onAddEntry, onDeleteEntry }: Props) {
  // 入力中のセル（costType-payMethod をキーに）
  const [openCell, setOpenCell] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  function cellKey(c: CostType, p: PayMethod) {
    return `${c}-${p}`;
  }

  async function handleAdd(costType: CostType, payMethod: PayMethod) {
    if (!category.trim() || !amount || saving) return;
    setSaving(true);
    try {
      await onAddEntry({
        year, month, day: 1,
        category: category.trim(),
        amount: parseInt(amount, 10),
        type: "EXPENSE",
        costType,
        payMethod,
      });
      setCategory("");
      setAmount("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-2">
        <p className="text-muted-foreground">月末に1回、明細を見ながら6つの枠に振り分けるだけ。</p>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          <p className="rounded-md bg-blue-50 px-2.5 py-2 leading-relaxed">
            <span className="font-semibold text-blue-600">固定費</span> ＝ 毎月ほぼ同じ額で出ていくお金
            <span className="text-muted-foreground">（家賃・通信費・保険・サブスクなど）。一度見直すとずっと効くので、節約はここから💪</span>
          </p>
          <p className="rounded-md bg-orange-50 px-2.5 py-2 leading-relaxed">
            <span className="font-semibold text-orange-600">変動費</span> ＝ 月によって変わるお金
            <span className="text-muted-foreground">（食費・日用品・娯楽・交際費など）。使いすぎた月に気づける。</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          支払い方法で振り分けると楽：クレカ明細→①②／銀行アプリ→③④／現金レシート→⑤⑥
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {SIX_GRID_CELLS.map((cell) => {
          const data = gridTotals.find(
            (g) => g.costType === cell.costType && g.payMethod === cell.payMethod
          );
          const entries = data?.entries ?? [];
          const total = data?.amount ?? 0;
          const key = cellKey(cell.costType, cell.payMethod);
          const isOpen = openCell === key;
          const costColor = COST_TYPE_CONFIG[cell.costType].color;

          return (
            <Card key={key}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                      {cell.num}
                    </span>
                    <span className={costColor}>{COST_TYPE_CONFIG[cell.costType].label}</span>
                    <span className="text-muted-foreground">×</span>
                    <span>{PAY_METHOD_CONFIG[cell.payMethod].short}</span>
                  </span>
                  <span className="font-bold tabular-nums">{yen(total)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {entries.length > 0 && (
                  <ul className="space-y-1">
                    {entries.map((e) => (
                      <li
                        key={e.id}
                        className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1 text-xs"
                      >
                        <span className="truncate">{e.category}</span>
                        <span className="flex items-center gap-2">
                          <span className="tabular-nums">{yen(e.amount)}</span>
                          <button
                            type="button"
                            onClick={() => onDeleteEntry(e.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="削除"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {isOpen ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-2">
                      <Input
                        placeholder="項目（例: 通信費）"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="col-span-3 h-11 text-base"
                      />
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="金額"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="col-span-2 h-11 text-base"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="flex-1 h-11"
                        disabled={saving || !category.trim() || !amount}
                        onClick={() => handleAdd(cell.costType, cell.payMethod)}
                      >
                        {saving ? "保存中..." : "追加"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11"
                        onClick={() => {
                          setOpenCell(null);
                          setCategory("");
                          setAmount("");
                        }}
                      >
                        閉じる
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 text-sm"
                    onClick={() => {
                      setOpenCell(key);
                      setCategory("");
                      setAmount("");
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    ここに記録を追加
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
