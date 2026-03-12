"use client";

import { useState, useEffect, useCallback } from "react";
import { db } from "@/lib/dream-db";
import type { DreamGoal } from "@/types/dream";

export function useDream() {
  const [dream, setDream] = useState<DreamGoal | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const goal = await db.dream.get(1);
    setDream(goal ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveDream = useCallback(
    async (data: Omit<DreamGoal, "id" | "createdAt">) => {
      const existing = await db.dream.get(1);
      if (existing) {
        await db.dream.update(1, data);
      } else {
        await db.dream.put({ ...data, id: 1, createdAt: Date.now() });
      }
      await refresh();
    },
    [refresh]
  );

  return { dream, loading, saveDream, refresh };
}
