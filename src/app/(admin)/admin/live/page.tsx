"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Radio } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface LiveStreamItem {
  id: string;
  title: string;
  description: string | null;
  embedUrl: string | null;
  scheduledAt: string;
  isLive: boolean;
}

export default function AdminLivePage() {
  const [streams, setStreams] = useState<LiveStreamItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEmbedUrl, setFormEmbedUrl] = useState("");
  const [formScheduledAt, setFormScheduledAt] = useState("");

  const fetchStreams = useCallback(async () => {
    const res = await fetch("/api/admin/live");
    if (res.ok) {
      setStreams(await res.json());
    }
  }, []);

  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/admin/live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || null,
          embedUrl: formEmbedUrl || null,
          scheduledAt: formScheduledAt,
        }),
      });
      setFormTitle("");
      setFormDescription("");
      setFormEmbedUrl("");
      setFormScheduledAt("");
      setShowForm(false);
      fetchStreams();
    } catch {
      alert("作成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ライブ配信管理</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          新規配信
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>新しいライブ配信</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>タイトル</Label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>説明</Label>
                <Textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>配信日時</Label>
                  <Input
                    type="datetime-local"
                    value={formScheduledAt}
                    onChange={(e) => setFormScheduledAt(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>YouTube Live URL</Label>
                  <Input
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formEmbedUrl}
                    onChange={(e) => setFormEmbedUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>保存</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Summary stats */}
      {streams.length > 0 && (() => {
        const now = new Date();
        const past = streams.filter((s) => new Date(s.scheduledAt) < now && !s.isLive).length;
        const upcoming = streams.filter((s) => new Date(s.scheduledAt) >= now).length;
        const live = streams.filter((s) => s.isLive).length;
        return (
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
            <span className="text-sm">
              全 <span className="font-medium">{streams.length}</span> 配信
            </span>
            {live > 0 && (
              <Badge className="bg-red-500">LIVE: {live}</Badge>
            )}
            <span className="text-sm">
              配信予定: <span className="font-medium">{upcoming}</span>
            </span>
            <span className="text-sm">
              配信済み: <span className="font-medium">{past}</span>
            </span>
          </div>
        );
      })()}

      <div className="space-y-2">
        {streams.map((stream) => (
          <Card key={stream.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <Radio className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{stream.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(stream.scheduledAt)}
                </p>
              </div>
              {stream.isLive && <Badge className="bg-red-500">LIVE</Badge>}
              {stream.embedUrl && (
                <Badge variant="outline">URL設定済み</Badge>
              )}
            </CardContent>
          </Card>
        ))}
        {streams.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            配信はまだ登録されていません
          </p>
        )}
      </div>
    </div>
  );
}
