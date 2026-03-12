"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatYen } from "@/lib/utils";
import { Plus, Trash2, ChevronLeft, ChevronRight, Wallet, Sparkles } from "lucide-react";
import Link from "next/link";

interface BudgetEntry {
  id: string;
  year: number;
  month: number;
  category: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "SAVING";
  memo: string | null;
}

const categories = {
  INCOME: ["給与", "副業", "投資収入", "配当金", "その他収入"],
  EXPENSE: [
    "住居費",
    "食費",
    "光熱費",
    "通信費",
    "交通費",
    "保険",
    "医療費",
    "教育費",
    "趣味・娯楽",
    "衣服",
    "日用品",
    "交際費",
    "その他支出",
  ],
  SAVING: ["預金", "NISA", "iDeCo", "投資信託", "その他貯蓄"],
};

const typeLabels: Record<string, { label: string; color: string }> = {
  INCOME: { label: "収入", color: "text-green-600" },
  EXPENSE: { label: "支出", color: "text-red-600" },
  SAVING: { label: "貯蓄", color: "text-blue-600" },
};

export default function BudgetPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE" | "SAVING">("EXPENSE");
  const [formCategory, setFormCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formMemo, setFormMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/budget?year=${year}&month=${month}`);
    const data = await res.json();
    setEntries(data);
  }, [year, month]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  function prevMonth() {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  }

  function nextMonth() {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formCategory || !formAmount) return;

    setLoading(true);
    try {
      await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year,
          month,
          category: formCategory,
          amount: parseInt(formAmount),
          type: formType,
          memo: formMemo || null,
        }),
      });
      setFormCategory("");
      setFormAmount("");
      setFormMemo("");
      setShowForm(false);
      fetchEntries();
    } catch {
      alert("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/budget/${id}`, { method: "DELETE" });
    fetchEntries();
  }

  const totalIncome = entries
    .filter((e) => e.type === "INCOME")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries
    .filter((e) => e.type === "EXPENSE")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalSaving = entries
    .filter((e) => e.type === "SAVING")
    .reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense - totalSaving;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">家計簿</h1>
        <p className="text-muted-foreground mt-1">
          毎月の収支を記録してFIREへの進捗を確認しましょう
        </p>
      </div>

      {/* Dream Unlocker banner */}
      <Link href="/budget/dream">
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
          <CardContent className="flex items-center gap-3 p-4">
            <Sparkles className="h-5 w-5 text-purple-500 shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-sm">ドリーム・アンロッカー</p>
              <p className="text-xs text-muted-foreground">
                節約をスタンプで記録して、夢の画像をアンロックしよう！
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </CardContent>
        </Card>
      </Link>

      {/* Month selector */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-lg font-bold min-w-[140px] text-center">
          {year}年{month}月
        </span>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">収入</p>
            <p className="text-lg font-bold text-green-600">
              {formatYen(totalIncome)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">支出</p>
            <p className="text-lg font-bold text-red-600">
              {formatYen(totalExpense)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">貯蓄</p>
            <p className="text-lg font-bold text-blue-600">
              {formatYen(totalSaving)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">残高</p>
            <p
              className={`text-lg font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatYen(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add entry */}
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          記録を追加
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">新しい記録</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                {(["INCOME", "EXPENSE", "SAVING"] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={formType === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setFormType(t);
                      setFormCategory("");
                    }}
                  >
                    {typeLabels[t].label}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Label>カテゴリ</Label>
                <div className="flex flex-wrap gap-2">
                  {categories[formType].map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={formCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">金額（円）</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memo">メモ</Label>
                  <Input
                    id="memo"
                    placeholder="任意"
                    value={formMemo}
                    onChange={(e) => setFormMemo(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !formCategory || !formAmount}>
                  {loading ? "保存中..." : "保存"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Entry list */}
      <div className="space-y-2">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="flex items-center gap-3 p-3">
              <Wallet className={`h-4 w-4 ${typeLabels[entry.type].color} shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {typeLabels[entry.type].label}
                  </Badge>
                  <span className="text-sm font-medium">{entry.category}</span>
                </div>
                {entry.memo && (
                  <p className="text-xs text-muted-foreground truncate">
                    {entry.memo}
                  </p>
                )}
              </div>
              <span className={`font-bold ${typeLabels[entry.type].color}`}>
                {formatYen(entry.amount)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => handleDelete(entry.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            {year}年{month}月の記録はまだありません
          </p>
        )}
      </div>
    </div>
  );
}
