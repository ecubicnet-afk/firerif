"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

interface JournalFormProps {
  onSave: (data: {
    date: string;
    content: string;
    amount: number | null;
    note: string | null;
  }) => Promise<void>;
  loading: boolean;
}

export function JournalForm({ onSave, loading }: JournalFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [content, setContent] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    await onSave({
      date,
      content: content.trim(),
      amount: amount ? parseInt(amount, 10) : null,
      note: note.trim() || null,
    });

    setContent("");
    setAmount("");
    setNote("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">今日の節約を記録</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="journal-date">日付</Label>
              <Input
                id="journal-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="journal-amount">
                節約金額
                <span className="text-muted-foreground text-xs ml-1">
                  （任意）
                </span>
              </Label>
              <Input
                id="journal-amount"
                type="number"
                placeholder="500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={0}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="journal-content">節約した内容</Label>
            <Input
              id="journal-content"
              placeholder="お弁当を持参した"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="journal-note">
              その日の気づき
              <span className="text-muted-foreground text-xs ml-1">
                （任意）
              </span>
            </Label>
            <Textarea
              id="journal-note"
              placeholder="手作りの方が美味しかった"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !content.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            {loading ? "保存中..." : "今日の節約を記録する"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
