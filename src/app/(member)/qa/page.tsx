"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/video/video-player";
import { Send, MessageCircleQuestion } from "lucide-react";

interface Question {
  id: string;
  content: string;
  status: "PENDING" | "SYNCED" | "ANSWERED";
  answerVideoUrl: string | null;
  createdAt: string;
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  PENDING: { label: "受付中", variant: "outline" },
  SYNCED: { label: "確認済み", variant: "secondary" },
  ANSWERED: { label: "回答済み", variant: "default" },
};

export default function QAPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchQuestions = useCallback(async () => {
    const res = await fetch("/api/questions");
    const data = await res.json();
    setQuestions(data);
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setLoading(true);
    try {
      await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newQuestion }),
      });
      setNewQuestion("");
      fetchQuestions();
    } catch {
      alert("質問の送信に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Q&A</h1>
        <p className="text-muted-foreground mt-1">
          質問を投稿すると、動画で回答いたします
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircleQuestion className="h-5 w-5" />
            質問を投稿する
          </CardTitle>
          <CardDescription>
            投資・節約・家計管理に関する質問をお寄せください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="質問内容を入力してください..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={4}
            />
            <Button type="submit" disabled={loading || !newQuestion.trim()}>
              <Send className="h-4 w-4 mr-1" />
              {loading ? "送信中..." : "質問を送信"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">あなたの質問</h2>
        {questions.map((q) => (
          <Card key={q.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm">{q.content}</p>
                <Badge variant={statusLabels[q.status]?.variant || "outline"}>
                  {statusLabels[q.status]?.label || q.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(q.createdAt).toLocaleDateString("ja-JP")}
              </p>
              {q.answerVideoUrl && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">回答動画:</p>
                  <VideoPlayer url={q.answerVideoUrl} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            まだ質問がありません。上のフォームから質問を投稿してみましょう。
          </p>
        )}
      </div>
    </div>
  );
}
