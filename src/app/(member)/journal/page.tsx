"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { StreakCounter } from "@/components/journal/StreakCounter";
import { JournalForm } from "@/components/journal/JournalForm";
import { JournalCard } from "@/components/journal/JournalCard";

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  amount: number | null;
  note: string | null;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [streak, setStreak] = useState({ currentStreak: 0, totalEntries: 0 });
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async () => {
    const res = await fetch("/api/journal");
    const data = await res.json();
    setEntries(data);
  }, []);

  const fetchStreak = useCallback(async () => {
    const res = await fetch("/api/journal/streak");
    const data = await res.json();
    setStreak(data);
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchStreak();
  }, [fetchEntries, fetchStreak]);

  async function handleSave(data: {
    date: string;
    content: string;
    amount: number | null;
    note: string | null;
  }) {
    setLoading(true);
    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      fetchEntries();
      fetchStreak();
    } catch {
      alert("保存に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/journal/${id}`, { method: "DELETE" });
    fetchEntries();
    fetchStreak();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">節約ジャーナル</h1>
        <p className="text-muted-foreground mt-1">
          毎日の節約を記録して、習慣にしましょう
        </p>
      </div>

      <StreakCounter
        currentStreak={streak.currentStreak}
        totalEntries={streak.totalEntries}
      />

      <JournalForm onSave={handleSave} loading={loading} />

      {entries.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            過去の記録 ({entries.length})
          </h2>
          {entries.map((entry) => (
            <JournalCard
              key={entry.id}
              entry={entry}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 gap-3">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              最初の節約を記録してみましょう
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
