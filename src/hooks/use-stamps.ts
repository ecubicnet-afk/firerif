"use client";

import { useState, useEffect, useCallback } from "react";
import { db, seedDefaultStamps } from "@/lib/dream-db";
import type { Stamp } from "@/types/dream";

export function useStamps() {
  const [stamps, setStamps] = useState<Stamp[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    await seedDefaultStamps();
    const all = await db.stamps.orderBy("sortOrder").toArray();
    setStamps(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addStamp = useCallback(
    async (stamp: Omit<Stamp, "id">) => {
      await db.stamps.add(stamp as Stamp);
      await refresh();
    },
    [refresh]
  );

  const updateStamp = useCallback(
    async (id: number, data: Partial<Stamp>) => {
      await db.stamps.update(id, data);
      await refresh();
    },
    [refresh]
  );

  const deleteStamp = useCallback(
    async (id: number) => {
      await db.stamps.delete(id);
      await refresh();
    },
    [refresh]
  );

  const resetDefaults = useCallback(async () => {
    await db.stamps.clear();
    await seedDefaultStamps();
    await refresh();
  }, [refresh]);

  return { stamps, loading, addStamp, updateStamp, deleteStamp, resetDefaults, refresh };
}
