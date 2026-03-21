"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface SubmissionFormProps {
  assignmentId: string;
  initialContent?: string;
  isResubmit?: boolean;
  onSubmit: (assignmentId: string, content: string) => Promise<void>;
  loading: boolean;
}

export function SubmissionForm({
  assignmentId,
  initialContent = "",
  isResubmit = false,
  onSubmit,
  loading,
}: SubmissionFormProps) {
  const [content, setContent] = useState(initialContent);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    await onSubmit(assignmentId, content.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3">
      <Textarea
        placeholder="回答を入力してください..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        required
      />
      <Button
        type="submit"
        size="sm"
        disabled={loading || !content.trim()}
      >
        <Send className="h-4 w-4 mr-1" />
        {loading
          ? "送信中..."
          : isResubmit
          ? "再提出する"
          : "提出する"}
      </Button>
    </form>
  );
}
