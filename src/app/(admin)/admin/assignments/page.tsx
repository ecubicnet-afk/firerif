"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Submission {
  id: string;
  content: string;
  status: "SUBMITTED" | "REVIEWED" | "COMPLETED";
  feedback: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  submissions: Submission[];
}

const statusLabels: Record<string, string> = {
  SUBMITTED: "提出済み",
  REVIEWED: "レビュー済み",
  COMPLETED: "完了",
};

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    const res = await fetch("/api/admin/assignments");
    const data = await res.json();
    setAssignments(data);
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setLoading(true);
    try {
      await fetch("/api/admin/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription || null,
          dueDate: newDueDate || null,
        }),
      });
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
      fetchAssignments();
    } catch {
      alert("作成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("この課題を削除しますか？")) return;
    await fetch(`/api/admin/assignments/${id}`, { method: "DELETE" });
    fetchAssignments();
  }

  async function handleReview(
    submissionId: string,
    status: string,
    feedback: string
  ) {
    // Find the assignment that contains this submission
    const assignment = assignments.find((a) =>
      a.submissions.some((s) => s.id === submissionId)
    );
    if (!assignment) return;

    await fetch(`/api/admin/assignments/${assignment.id}/review`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId, status, feedback }),
    });
    fetchAssignments();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">課題管理</h1>
        <p className="text-muted-foreground mt-1">
          課題の作成・管理・レビュー
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">新しい課題を作成</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                placeholder="課題のタイトル"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明（任意）</Label>
              <Textarea
                id="description"
                placeholder="課題の説明"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">期限（任意）</Label>
              <Input
                id="dueDate"
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-48"
              />
            </div>
            <Button type="submit" disabled={loading || !newTitle.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              課題を作成
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          課題一覧 ({assignments.length})
        </h2>
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">
                    {assignment.title}
                  </CardTitle>
                  {assignment.description && (
                    <CardDescription className="mt-1">
                      {assignment.description}
                    </CardDescription>
                  )}
                  {assignment.dueDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      期限: {formatDate(new Date(assignment.dueDate))}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    提出: {assignment.submissions.length}件
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(assignment.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {assignment.submissions.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedId(
                        expandedId === assignment.id ? null : assignment.id
                      )
                    }
                    className="w-full justify-between"
                  >
                    <span className="text-xs">提出物を見る</span>
                    {expandedId === assignment.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>

                  {expandedId === assignment.id && (
                    <div className="mt-3 space-y-4">
                      {assignment.submissions.map((sub) => (
                        <SubmissionReviewCard
                          key={sub.id}
                          submission={sub}
                          onReview={handleReview}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SubmissionReviewCard({
  submission,
  onReview,
}: {
  submission: Submission;
  onReview: (id: string, status: string, feedback: string) => void;
}) {
  const [feedback, setFeedback] = useState(submission.feedback || "");

  return (
    <div className="rounded-md border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          {submission.user.name || submission.user.email}
        </p>
        <Badge variant="outline">{statusLabels[submission.status]}</Badge>
      </div>
      <p className="text-sm whitespace-pre-wrap bg-muted rounded p-2">
        {submission.content}
      </p>
      <div className="space-y-2">
        <Textarea
          placeholder="フィードバックを入力..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={2}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReview(submission.id, "REVIEWED", feedback)}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            レビュー済みにする
          </Button>
          <Button
            size="sm"
            onClick={() => onReview(submission.id, "COMPLETED", feedback)}
            className="bg-green-600 hover:bg-green-700"
          >
            完了にする
          </Button>
        </div>
      </div>
    </div>
  );
}
