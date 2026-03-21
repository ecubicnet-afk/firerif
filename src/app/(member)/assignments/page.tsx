"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";

interface Submission {
  id: string;
  content: string;
  status: "SUBMITTED" | "REVIEWED" | "COMPLETED";
  feedback: string | null;
  createdAt: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  submissions: Submission[];
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    const res = await fetch("/api/assignments");
    const data = await res.json();
    setAssignments(data);
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  async function handleSubmit(assignmentId: string, content: string) {
    setLoading(true);
    try {
      const existing = assignments.find((a) => a.id === assignmentId);
      const hasSubmission = existing?.submissions?.[0];

      await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: hasSubmission ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      fetchAssignments();
    } catch {
      alert("提出に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  const pending = assignments.filter((a) => !a.submissions[0]);
  const submitted = assignments.filter((a) => a.submissions[0]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">課題提出</h1>
        <p className="text-muted-foreground mt-1">
          学習課題を確認して提出しましょう
        </p>
      </div>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 gap-3">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              現在、課題はありません
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                未提出 ({pending.length})
              </h2>
              {pending.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              ))}
            </div>
          )}

          {submitted.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                提出済み ({submitted.length})
              </h2>
              {submitted.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onSubmit={handleSubmit}
                  loading={loading}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
