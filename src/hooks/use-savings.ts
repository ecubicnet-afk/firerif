"use client";

import { useState, useEffect, useCallback } from "react";
import { db, seedDefaultStamps } from "@/lib/dream-db";
import type { SavingsEntry } from "@/types/dream";

export function useSavings() {
  const [entries, setEntries] = useState<SavingsEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await db.savings.orderBy("id").reverse().toArray();
    setEntries(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    seedDefaultStamps().then(refresh);
  }, [refresh]);

  const addEntry = useCallback(
    async (entry: Omit<SavingsEntry, "id">) => {
      await db.savings.add(entry as SavingsEntry);
      await refresh();
    },
    [refresh]
  );

  const deleteEntry = useCallback(
    async (id: number) => {
      await db.savings.delete(id);
      await refresh();
    },
    [refresh]
  );

  const getEntriesByMonth = useCallback(
    (year: number, month: number) => {
      const prefix = `${year}-${String(month).padStart(2, "0")}`;
      return entries.filter((e) => e.date.startsWith(prefix));
    },
    [entries]
  );

  const getEntriesByWeek = useCallback(
    (date: Date) => {
      const start = new Date(date);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      const startStr = start.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];
      return entries.filter((e) => e.date >= startStr && e.date < endStr);
    },
    [entries]
  );

  return {
    entries,
    loading,
    addEntry,
    deleteEntry,
    getEntriesByMonth,
    getEntriesByWeek,
    refresh,
  };
}
