"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { formatYen } from "@/lib/utils";
import { Plus, Trash2, TrendingUp } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  memo: string | null;
}

const categoryLabels: Record<string, string> = {
  CASH: "現金・預金",
  STOCK: "株式",
  BOND: "債券",
  REAL_ESTATE: "不動産",
  CRYPTO: "暗号資産",
  PENSION: "年金（iDeCo等）",
  OTHER: "その他",
};

const categoryOptions = Object.entries(categoryLabels);

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("CASH");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formMemo, setFormMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAssets = useCallback(async () => {
    const res = await fetch("/api/assets");
    const data = await res.json();
    setAssets(data);
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          category: formCategory,
          amount: parseInt(formAmount),
          date: formDate,
          memo: formMemo || null,
        }),
      });
      setFormName("");
      setFormAmount("");
      setFormMemo("");
      setShowForm(false);
      fetchAssets();
    } catch {
      alert("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/assets/${id}`, { method: "DELETE" });
    fetchAssets();
  }

  const totalAssets = assets.reduce((sum, a) => sum + a.amount, 0);

  // Group by category
  const groupedByCategory = assets.reduce(
    (acc, asset) => {
      const cat = asset.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(asset);
      return acc;
    },
    {} as Record<string, Asset[]>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">資産管理</h1>
        <p className="text-muted-foreground mt-1">
          資産の推移を記録してFIRE達成までの道のりを把握しましょう
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center gap-4 p-6">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">総資産</p>
            <p className="text-3xl font-bold">{formatYen(totalAssets)}</p>
          </div>
        </CardContent>
      </Card>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          資産を記録
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">新しい資産記録</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">資産名</Label>
                  <Input
                    id="name"
                    placeholder="例: NISA口座、楽天銀行"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">カテゴリ</Label>
                  <select
                    id="category"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    {categoryOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
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
                  <Label htmlFor="date">記録日</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                  />
                </div>
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
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !formName || !formAmount}>
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

      {Object.entries(groupedByCategory).map(([cat, catAssets]) => (
        <div key={cat} className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            {categoryLabels[cat] || cat}
            <Badge variant="secondary">
              {formatYen(catAssets.reduce((s, a) => s + a.amount, 0))}
            </Badge>
          </h2>
          {catAssets.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(asset.date).toLocaleDateString("ja-JP")}
                    {asset.memo && ` - ${asset.memo}`}
                  </p>
                </div>
                <span className="font-bold">{formatYen(asset.amount)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(asset.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}

      {assets.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          まだ資産の記録がありません。上のボタンから記録を始めましょう。
        </p>
      )}
    </div>
  );
}
