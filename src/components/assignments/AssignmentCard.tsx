"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SubmissionForm } from "./SubmissionForm";

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

interface AssignmentCardProps {
  assignment: Assignment;
  onSubmit: (assignmentId: string, content: string) => Promise<void>;
  loading: boolean;
}

const statusConfig = {
  SUBMITTED: { label: "提出済み", variant: "default" as const },
  REVIEWED: { label: "レビュー済み", variant: "secondary" as const },
  COMPLETED: { label: "完了", variant: "outline" as const },
};

export function AssignmentCard({
  assignment,
  onSubmit,
  loading,
}: AssignmentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const submission = assignment.submissions[0] || null;
  const hasSubmitted = !!submission;

  const statusBadge = hasSubmitted ? (
    <Badge
      variant={statusConfig[submission.status].variant}
      className={
        submission.status === "COMPLETED"
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : submission.status === "REVIEWED"
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
          : ""
      }
    >
      {statusConfig[submission.status].label}
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      未提出
    </Badge>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">{assignment.title}</CardTitle>
            {assignment.dueDate && (
              <p className="text-xs text-muted-foreground mt-1">
                期限: {formatDate(new Date(assignment.dueDate))}
              </p>
            )}
          </div>
          {statusBadge}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {assignment.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {assignment.description}
          </p>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full justify-between"
        >
          <span className="text-xs">
            {hasSubmitted ? "提出内容を見る" : "回答を入力する"}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {expanded && (
          <div className="mt-3 space-y-3">
            {hasSubmitted ? (
              <>
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    あなたの回答
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {submission.content}
                  </p>
                </div>

                {submission.feedback && (
                  <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <MessageSquare className="h-3 w-3 text-primary" />
                      <p className="text-xs font-medium text-primary">
                        フィードバック
                      </p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                {submission.status === "REVIEWED" && (
                  <SubmissionForm
                    assignmentId={assignment.id}
                    initialContent={submission.content}
                    isResubmit
                    onSubmit={onSubmit}
                    loading={loading}
                  />
                )}
              </>
            ) : (
              <SubmissionForm
                assignmentId={assignment.id}
                onSubmit={onSubmit}
                loading={loading}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
