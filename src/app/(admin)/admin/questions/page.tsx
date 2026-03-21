"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Send, CheckCircle, Clock, ArrowRight } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "未回答",
  SYNCED: "同期済み",
  ANSWERED: "回答済み",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "destructive",
  SYNCED: "secondary",
  ANSWERED: "default",
};

interface QuestionWithUser {
  id: string;
  content: string;
  status: string;
  answerVideoUrl: string | null;
  createdAt: string;
  user: { email: string; name: string | null };
}

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithUser[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchQuestions = useCallback(async () => {
    const res = await fetch("/api/admin/questions");
    if (res.ok) {
      setQuestions(await res.json());
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  async function handleSync() {
    setSyncing(true);
    setSyncResult("");
    try {
      const res = await fetch("/api/admin/sync-questions", { method: "POST" });
      const data = await res.json();
      setSyncResult(
        `${data.synced}/${data.total}件をスプレッドシートに同期しました`
      );
      fetchQuestions();
    } catch {
      setSyncResult("同期に失敗しました");
    } finally {
      setSyncing(false);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    setUpdatingId(id);
    try {
      await fetch("/api/admin/questions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchQuestions();
    } catch {
      alert("ステータスの更新に失敗しました");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">質問管理</h1>
        <Button onClick={handleSync} disabled={syncing}>
          {syncing ? (
            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-1" />
          )}
          スプレッドシートに同期
        </Button>
      </div>

      {syncResult && (
        <div className="rounded-md bg-primary/10 p-3 text-sm">
          {syncResult}
        </div>
      )}

      {questions.length > 0 && (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
          <span className="text-sm font-medium">
            全{questions.length}件:
          </span>
          {(["PENDING", "SYNCED", "ANSWERED"] as const).map((status) => {
            const count = questions.filter((q) => q.status === status).length;
            return (
              <Badge
                key={status}
                variant={statusVariants[status]}
                className="text-xs"
              >
                {STATUS_LABELS[status]}: {count}件
              </Badge>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        {questions.map((q) => (
          <Card key={q.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{q.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {q.user.name || q.user.email} ・{" "}
                    {new Date(q.createdAt).toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <Badge variant={statusVariants[q.status] || "outline"}>
                  {STATUS_LABELS[q.status] || q.status}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                {q.status === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updatingId === q.id}
                      onClick={() => handleStatusChange(q.id, "SYNCED")}
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      同期済みにする
                    </Button>
                    <Button
                      size="sm"
                      disabled={updatingId === q.id}
                      onClick={() => handleStatusChange(q.id, "ANSWERED")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      回答済みにする
                    </Button>
                  </>
                )}
                {q.status === "SYNCED" && (
                  <>
                    <Button
                      size="sm"
                      disabled={updatingId === q.id}
                      onClick={() => handleStatusChange(q.id, "ANSWERED")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      回答済みにする
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={updatingId === q.id}
                      onClick={() => handleStatusChange(q.id, "PENDING")}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      未回答に戻す
                    </Button>
                  </>
                )}
                {q.status === "ANSWERED" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={updatingId === q.id}
                    onClick={() => handleStatusChange(q.id, "PENDING")}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    未回答に戻す
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {questions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            質問はまだありません
          </p>
        )}
      </div>
    </div>
  );
}
