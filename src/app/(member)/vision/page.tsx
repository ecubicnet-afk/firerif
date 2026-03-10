"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatYen, formatDate } from "@/lib/utils";
import { Plus, Trash2, Target } from "lucide-react";

interface VisionItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  targetDate: string | null;
  targetAmount: number | null;
  sortOrder: number;
}

export default function VisionPage() {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formTargetAmount, setFormTargetAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/vision");
    const data = await res.json();
    setItems(data);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || null,
          imageUrl: formImageUrl || null,
          targetDate: formTargetDate || null,
          targetAmount: formTargetAmount ? parseInt(formTargetAmount) : null,
        }),
      });
      setFormTitle("");
      setFormDescription("");
      setFormImageUrl("");
      setFormTargetDate("");
      setFormTargetAmount("");
      setShowForm(false);
      fetchItems();
    } catch {
      alert("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/vision/${id}`, { method: "DELETE" });
    fetchItems();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ビジョンボード</h1>
        <p className="text-muted-foreground mt-1">
          FIREした後の生活を具体的にイメージして目標を可視化しましょう
        </p>
      </div>

      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          ビジョンを追加
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">新しいビジョン</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル</Label>
                <Input
                  id="title"
                  placeholder="例: 海外でのんびり暮らす"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">詳細</Label>
                <Textarea
                  id="description"
                  placeholder="具体的なイメージを書いてください"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">画像URL（任意）</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://..."
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetDate">目標日</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formTargetDate}
                    onChange={(e) => setFormTargetDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">目標金額（円）</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    placeholder="0"
                    value={formTargetAmount}
                    onChange={(e) => setFormTargetAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || !formTitle}>
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

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {item.imageUrl && (
              <div className="aspect-video bg-muted relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary shrink-0" />
                  <h3 className="font-bold">{item.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              )}
              <div className="flex gap-4 text-xs text-muted-foreground">
                {item.targetDate && (
                  <span>目標日: {formatDate(item.targetDate)}</span>
                )}
                {item.targetAmount && (
                  <span>目標金額: {formatYen(item.targetAmount)}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 gap-3">
            <Target className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              ビジョンボードを作成して、理想の未来を描きましょう
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
