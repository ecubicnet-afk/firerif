"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatYen } from "@/lib/utils";
import {
  Plus, Trash2, ChevronLeft, ChevronRight, Wallet, Sparkles,
  ImageIcon, X, Target, Settings,
} from "lucide-react";
import { useSavings } from "@/hooks/use-savings";
import { useDream } from "@/hooks/use-dream";
import { useStamps } from "@/hooks/use-stamps";
import { usePreferences } from "@/hooks/use-preferences";
import { DreamView } from "@/components/dream/DreamView";
import { StampPad } from "@/components/dream/StampPad";
import { Ledger } from "@/components/dream/Ledger";
import { StampEditor } from "@/components/dream/StampEditor";

interface BudgetEntry {
  id: string;
  year: number;
  month: number;
  category: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "SAVING";
  memo: string | null;
  imageData: string | null;
  createdAt: string;
}

interface BudgetPlan {
  id: string;
  category: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "SAVING";
}

const categories = {
  INCOME: ["給与", "副業", "投資収入", "配当金", "その他収入"],
  EXPENSE: [
    "住居費", "食費", "光熱費", "通信費", "交通費", "保険",
    "医療費", "教育費", "趣味・娯楽", "衣服", "日用品", "交際費", "その他支出",
  ],
  SAVING: ["預金", "NISA", "iDeCo", "投資信託", "その他貯蓄"],
};

const typeLabels: Record<string, { label: string; color: string }> = {
  INCOME: { label: "収入", color: "text-green-600" },
  EXPENSE: { label: "支出", color: "text-red-600" },
  SAVING: { label: "貯蓄", color: "text-blue-600" },
};

const EXPENSE_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6",
  "#a855f7", "#6366f1", "#84cc16",
];

export default function BudgetPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState<BudgetEntry[]>([]);
  const [plans, setPlans] = useState<BudgetPlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [formType, setFormType] = useState<"INCOME" | "EXPENSE" | "SAVING">("EXPENSE");
  const [formCategory, setFormCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formMemo, setFormMemo] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [stampEditorOpen, setStampEditorOpen] = useState(false);

  // Plan form
  const [planType, setPlanType] = useState<"INCOME" | "EXPENSE" | "SAVING">("EXPENSE");
  const [planCategory, setPlanCategory] = useState("");
  const [planAmount, setPlanAmount] = useState("");

  // Dream hooks
  const { entries: dreamEntries, addEntry: addDreamEntry, deleteEntry: deleteDreamEntry, loading: savingsLoading } = useSavings();
  const { dream, saveDream, loading: dreamLoading } = useDream();
  const { stamps, addStamp, updateStamp, deleteStamp, resetDefaults, loading: stampsLoading } = useStamps();
  const { courseId, viewMode, setCourse, setViewMode } = usePreferences();

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/budget?year=${year}&month=${month}`);
    const data = await res.json();
    setEntries(data);
  }, [year, month]);

  const fetchPlans = useCallback(async () => {
    const res = await fetch(`/api/budget/plan?year=${year}&month=${month}`);
    const data = await res.json();
    setPlans(data);
  }, [year, month]);

  useEffect(() => {
    fetchEntries();
    fetchPlans();
  }, [fetchEntries, fetchPlans]);

  function prevMonth() {
    if (month === 1) { setYear(year - 1); setMonth(12); }
    else setMonth(month - 1);
  }

  function nextMonth() {
    if (month === 12) { setYear(year + 1); setMonth(1); }
    else setMonth(month + 1);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("画像は2MB以下にしてください");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFormImage(reader.result as string);
    reader.readAsDataURL(file);
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
          year, month,
          category: formCategory,
          amount: parseInt(formAmount),
          type: formType,
          memo: formMemo || null,
          imageData: formImage,
        }),
      });
      setFormCategory(""); setFormAmount(""); setFormMemo(""); setFormImage(null);
      setShowForm(false);
      fetchEntries();
    } catch {
      alert("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handlePlanSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!planCategory || !planAmount) return;
    await fetch("/api/budget/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        year, month,
        category: planCategory,
        amount: parseInt(planAmount),
        type: planType,
      }),
    });
    setPlanCategory(""); setPlanAmount("");
    setShowPlanForm(false);
    fetchPlans();
  }

  async function handleDeletePlan(id: string) {
    await fetch(`/api/budget/plan?id=${id}`, { method: "DELETE" });
    fetchPlans();
  }

  async function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/budget/${id}`, { method: "DELETE" });
    fetchEntries();
  }

  const totalIncome = entries.filter((e) => e.type === "INCOME").reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = entries.filter((e) => e.type === "EXPENSE").reduce((sum, e) => sum + e.amount, 0);
  const totalSaving = entries.filter((e) => e.type === "SAVING").reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpense - totalSaving;

  // Category breakdown for expenses
  const expenseByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    entries.filter((e) => e.type === "EXPENSE").forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [entries]);

  // Group entries by week
  const weeklyGroups = useMemo(() => {
    if (entries.length === 0) return [];
    const groups: { label: string; entries: BudgetEntry[] }[] = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const weekStart = new Date(firstDay);
    const dayOfWeek = weekStart.getDay();
    if (dayOfWeek !== 1) {
      weekStart.setDate(weekStart.getDate() - ((dayOfWeek + 6) % 7));
    }
    const ws = new Date(weekStart);
    while (ws <= lastDay) {
      const weekEnd = new Date(ws);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const wEntries = entries.filter((e) => {
        const d = new Date(e.createdAt || `${e.year}-${String(e.month).padStart(2, "0")}-15`);
        return d >= ws && d <= weekEnd;
      });
      const label = `${ws.getMonth() + 1}/${ws.getDate()} 〜 ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
      groups.push({ label, entries: wEntries });
      ws.setDate(ws.getDate() + 7);
    }
    return groups;
  }, [entries, year, month]);

  const isDreamLoading = savingsLoading || dreamLoading || stampsLoading;

  // Plan progress
  const planExpenseTotal = plans.filter((p) => p.type === "EXPENSE").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">家計簿と節約ドリーム</h1>
        <p className="text-muted-foreground mt-1">
          毎月の収支を記録してFIREへの進捗を確認しましょう
        </p>
      </div>

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
            <p className="text-lg font-bold text-green-600">{formatYen(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">支出</p>
            <p className="text-lg font-bold text-red-600">{formatYen(totalExpense)}</p>
            {planExpenseTotal > 0 && (
              <p className="text-[10px] text-muted-foreground">
                予算 {formatYen(planExpenseTotal)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">貯蓄</p>
            <p className="text-lg font-bold text-blue-600">{formatYen(totalSaving)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">残高</p>
            <p className={`text-lg font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatYen(balance)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category breakdown */}
      {expenseByCategory.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">カテゴリ別支出</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Bar chart */}
            <div className="flex h-6 rounded-full overflow-hidden">
              {expenseByCategory.map((cat, i) => {
                const pct = totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0;
                return (
                  <div
                    key={cat.category}
                    className="h-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}
                    title={`${cat.category}: ${formatYen(cat.amount)}`}
                  />
                );
              })}
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
              {expenseByCategory.map((cat, i) => {
                const pct = totalExpense > 0 ? Math.round((cat.amount / totalExpense) * 100) : 0;
                const plan = plans.find((p) => p.category === cat.category && p.type === "EXPENSE");
                return (
                  <div key={cat.category} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{ backgroundColor: EXPENSE_COLORS[i % EXPENSE_COLORS.length] }}
                    />
                    <span className="truncate">{cat.category}</span>
                    <span className="ml-auto font-bold whitespace-nowrap">{formatYen(cat.amount)}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                    {plan && (
                      <span className={`text-[10px] ${cat.amount > plan.amount ? "text-red-500" : "text-green-500"}`}>
                        /{formatYen(plan.amount)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget plan section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm">月の予算計画</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowPlanForm(!showPlanForm)}>
              <Settings className="h-3.5 w-3.5 mr-1" />
              設定
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {plans.length > 0 ? (
            <div className="space-y-2">
              {plans.map((plan) => {
                const actual = entries
                  .filter((e) => e.type === plan.type && e.category === plan.category)
                  .reduce((sum, e) => sum + e.amount, 0);
                const pct = plan.amount > 0 ? Math.min(Math.round((actual / plan.amount) * 100), 150) : 0;
                const over = actual > plan.amount;
                return (
                  <div key={plan.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px] px-1">
                          {typeLabels[plan.type]?.label}
                        </Badge>
                        <span className="font-medium">{plan.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={over ? "text-red-500 font-bold" : ""}>
                          {formatYen(actual)}
                        </span>
                        <span className="text-muted-foreground">/ {formatYen(plan.amount)}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleDeletePlan(plan.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${over ? "bg-red-500" : "bg-primary"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              予算を設定すると、カテゴリ別の進捗が確認できます
            </p>
          )}

          {showPlanForm && (
            <form onSubmit={handlePlanSubmit} className="mt-3 space-y-3 p-3 rounded-lg border">
              <div className="flex gap-2">
                {(["INCOME", "EXPENSE", "SAVING"] as const).map((t) => (
                  <Button key={t} type="button" variant={planType === t ? "default" : "outline"} size="sm"
                    onClick={() => { setPlanType(t); setPlanCategory(""); }}>
                    {typeLabels[t].label}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {categories[planType].map((cat) => (
                  <Button key={cat} type="button" variant={planCategory === cat ? "default" : "outline"} size="sm"
                    onClick={() => setPlanCategory(cat)} className="text-xs h-7">
                    {cat}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input type="number" placeholder="予算金額" value={planAmount}
                  onChange={(e) => setPlanAmount(e.target.value)} className="flex-1" />
                <Button size="sm" disabled={!planCategory || !planAmount}>設定</Button>
                <Button size="sm" variant="outline" type="button" onClick={() => setShowPlanForm(false)}>閉じる</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

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
                  <Button key={t} type="button" variant={formType === t ? "default" : "outline"} size="sm"
                    onClick={() => { setFormType(t); setFormCategory(""); }}>
                    {typeLabels[t].label}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Label>カテゴリ</Label>
                <div className="flex flex-wrap gap-2">
                  {categories[formType].map((cat) => (
                    <Button key={cat} type="button" variant={formCategory === cat ? "default" : "outline"} size="sm"
                      onClick={() => setFormCategory(cat)}>
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">金額（円）</Label>
                  <Input id="amount" type="number" placeholder="0" value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memo">メモ</Label>
                  <Input id="memo" placeholder="任意" value={formMemo}
                    onChange={(e) => setFormMemo(e.target.value)} />
                </div>
              </div>
              {/* Image attachment */}
              <div className="space-y-2">
                <Label>画像（レシートなど）</Label>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border hover:bg-accent transition-colors">
                    <ImageIcon className="h-4 w-4" />
                    画像を選択
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  {formImage && (
                    <div className="relative">
                      <img src={formImage} alt="preview" className="h-12 w-12 object-cover rounded" />
                      <button type="button" onClick={() => setFormImage(null)}
                        className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !formCategory || !formAmount}>
                  {loading ? "保存中..." : "保存"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setFormImage(null); }}>
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Entry list grouped by week */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {year}年{month}月の記録はまだありません
          </p>
        ) : (
          weeklyGroups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-muted-foreground">{group.label}</h3>
                {group.entries.length > 0 && (
                  <span className="text-xs text-muted-foreground">{group.entries.length}件</span>
                )}
              </div>
              {group.entries.length > 0 ? (
                <div className="space-y-2">
                  {group.entries.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="flex items-center gap-3 p-3">
                        {entry.imageData ? (
                          <img
                            src={entry.imageData}
                            alt=""
                            className="h-8 w-8 object-cover rounded shrink-0 cursor-pointer"
                            onClick={() => setExpandedImage(entry.imageData)}
                          />
                        ) : (
                          <Wallet className={`h-4 w-4 ${typeLabels[entry.type].color} shrink-0`} />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {typeLabels[entry.type].label}
                            </Badge>
                            <span className="text-sm font-medium">{entry.category}</span>
                          </div>
                          {entry.memo && (
                            <p className="text-xs text-muted-foreground truncate">{entry.memo}</p>
                          )}
                        </div>
                        <span className={`font-bold ${typeLabels[entry.type].color}`}>
                          {formatYen(entry.amount)}
                        </span>
                        <Button variant="ghost" size="icon" className="shrink-0"
                          onClick={() => handleDelete(entry.id)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3 bg-muted/30 rounded-lg">
                  記録なし
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Image modal */}
      {expandedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setExpandedImage(null)}>
          <img src={expandedImage} alt="" className="max-w-full max-h-[80vh] rounded-lg" />
        </div>
      )}

      {/* 節約ドリーム section */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">節約ドリーム</h2>
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          今日の節約が、20年後の夢のチケットに変わる
        </p>

        {isDreamLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Sparkles className="h-8 w-8 text-primary mx-auto animate-pulse" />
              <p className="text-sm text-muted-foreground">読み込み中...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <DreamView dream={dream} entries={dreamEntries} courseId={courseId} onSaveDream={saveDream} />
            <StampPad stamps={stamps} courseId={courseId} onSave={addDreamEntry}
              onEditStamps={() => setStampEditorOpen(true)} />
            <Ledger entries={dreamEntries} courseId={courseId} viewMode={viewMode}
              onCourseChange={setCourse} onViewModeChange={setViewMode} onDeleteEntry={deleteDreamEntry} />
          </div>
        )}
      </div>

      {/* Stamp Editor Modal */}
      {stampEditorOpen && (
        <StampEditor stamps={stamps} onUpdate={updateStamp} onAdd={addStamp}
          onDelete={deleteStamp} onResetDefaults={resetDefaults}
          onClose={() => setStampEditorOpen(false)} />
      )}
    </div>
  );
}
