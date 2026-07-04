"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Pencil } from "lucide-react";
import {
  SIX_GRID_CELLS,
  PAY_METHODS,
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
  onUpdateEntry: (id: string, patch: { category?: string; amount?: number }) => Promise<void>;
}

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

// 財布ごとの見出し・入力時に見るもの・絵文字
const WALLET_EMOJI: Record<PayMethod, string> = { CARD: "💳", BANK: "🏦", CASH: "💵" };
const WALLET_HINT: Record<PayMethod, string> = {
  CARD: "クレカ明細を見ながら",
  BANK: "通帳・銀行アプリを見ながら",
  CASH: "レシートを見ながら",
};

export function SixGridEntry({ year, month, gridTotals, onAddEntry, onDeleteEntry, onUpdateEntry }: Props) {
  // 入力中のセル（costType-payMethod をキーに）
  const [openCell, setOpenCell] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editCat, setEditCat] = useState("");
  const [editAmt, setEditAmt] = useState("");

  function startEdit(e: BudgetEntry) {
    setEditId(e.id);
    setEditCat(e.category);
    setEditAmt(String(e.amount));
  }
  async function saveEdit(id: string) {
    if (!editAmt) return;
    await onUpdateEntry(id, { category: editCat.trim() || "明細", amount: parseInt(editAmt, 10) });
    setEditId(null);
  }

  function cellKey(c: CostType, p: PayMethod) {
    return `${c}-${p}`;
  }

  async function handleAdd(costType: CostType, payMethod: PayMethod) {
    if (!amount || saving) return;
    setSaving(true);
    try {
      await onAddEntry({
        year, month, day: 1,
        category: category.trim() || "明細",
        amount: parseInt(amount, 10),
        type: "EXPENSE",
        costType,
        payMethod,
      });
      setCategory("");
      setAmount("");
      // 追加後すぐ次の金額を打てるよう、金額欄にフォーカスを戻す（連打入力）
      amountRef.current?.focus();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-2">
        <p className="text-muted-foreground">
          月末に1回、<span className="font-semibold">財布（クレカ・口座・現金）ごと</span>に明細を見ながら振り分けるだけ。
        </p>
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
          項目名は省略OK。金額だけ入れて「追加」を押せば、そのマスにどんどん足し算されます。
        </p>
      </div>

      {/* 財布ごとにグルーピング（クレカ → 口座 → 現金） */}
      {PAY_METHODS.map((pm) => {
        const cells = SIX_GRID_CELLS.filter((c) => c.payMethod === pm);
        const walletTotal = gridTotals
          .filter((g) => g.payMethod === pm)
          .reduce((s, g) => s + g.amount, 0);

        return (
          <div key={pm} className="space-y-2">
            {/* 財布見出し */}
            <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-lg" aria-hidden>{WALLET_EMOJI[pm]}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold leading-tight">{PAY_METHOD_CONFIG[pm].label}</p>
                  <p className="truncate text-[11px] text-muted-foreground leading-tight">{WALLET_HINT[pm]}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[11px] text-muted-foreground leading-tight">この財布の小計</p>
                <p className="text-base font-bold tabular-nums leading-tight">{yen(walletTotal)}</p>
              </div>
            </div>

            {/* この財布の2マス（固定費・変動費） */}
            <div className="grid gap-2 sm:grid-cols-2">
              {cells.map((cell) => {
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
                        </span>
                        <span className="font-bold tabular-nums">{yen(total)}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {entries.length > 0 && (
                        <ul className="space-y-1">
                          {entries.map((e) => (
                            <li key={e.id} className="rounded-md bg-muted/40 px-2 py-1 text-xs">
                              {editId === e.id ? (
                                <div className="space-y-1.5 py-1">
                                  <div className="grid grid-cols-5 gap-1.5">
                                    <Input
                                      value={editCat}
                                      onChange={(ev) => setEditCat(ev.target.value)}
                                      placeholder="項目名（任意）"
                                      className="col-span-3 h-10 text-sm"
                                    />
                                    <Input
                                      type="number"
                                      inputMode="numeric"
                                      value={editAmt}
                                      onChange={(ev) => setEditAmt(ev.target.value)}
                                      onKeyDown={(ev) => { if (ev.key === "Enter") saveEdit(e.id); }}
                                      className="col-span-2 h-10 text-sm"
                                    />
                                  </div>
                                  <div className="flex gap-1.5">
                                    <Button type="button" className="h-9 flex-1" disabled={!editAmt} onClick={() => saveEdit(e.id)}>
                                      保存
                                    </Button>
                                    <Button type="button" variant="outline" className="h-9" onClick={() => setEditId(null)}>
                                      キャンセル
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span className="truncate">{e.category}</span>
                                  <span className="flex items-center gap-2">
                                    <span className="tabular-nums">{yen(e.amount)}</span>
                                    <button
                                      type="button"
                                      onClick={() => startEdit(e)}
                                      className="-m-1 p-1 text-muted-foreground hover:text-primary"
                                      aria-label="編集"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (window.confirm(`「${e.category}（${yen(e.amount)}）」を削除しますか？`)) {
                                          onDeleteEntry(e.id);
                                        }
                                      }}
                                      className="-m-1 p-1 text-muted-foreground hover:text-destructive"
                                      aria-label="削除"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </span>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}

                      {isOpen ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-5 gap-2">
                            <Input
                              placeholder="項目名（任意）"
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className="col-span-3 h-11 text-base"
                            />
                            <Input
                              ref={amountRef}
                              type="number"
                              inputMode="numeric"
                              placeholder="金額"
                              autoFocus
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAdd(cell.costType, cell.payMethod);
                              }}
                              className="col-span-2 h-11 text-base"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              className="flex-1 h-11"
                              disabled={saving || !amount}
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
      })}
    </div>
  );
}
