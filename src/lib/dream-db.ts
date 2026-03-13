import Dexie, { type EntityTable } from "dexie";
import type { SavingsEntry, Stamp, DreamGoal } from "@/types/dream";
import { DEFAULT_STAMPS } from "./dream-constants";

const STAMPS_VERSION = 2; // Bump when DEFAULT_STAMPS changes
const STAMPS_VERSION_KEY = "firerif_stamps_version";

const db = new Dexie("DreamUnlockerDB") as Dexie & {
  savings: EntityTable<SavingsEntry, "id">;
  stamps: EntityTable<Stamp, "id">;
  dream: EntityTable<DreamGoal, "id">;
};

db.version(1).stores({
  savings: "++id, date, categoryId, stampId",
  stamps: "++id, categoryId, sortOrder",
  dream: "id",
});

// Version 2: notificationMessage field added to stamps (no schema change needed for Dexie)
db.version(2).stores({
  savings: "++id, date, categoryId, stampId",
  stamps: "++id, categoryId, sortOrder",
  dream: "id",
});

export async function seedDefaultStamps() {
  const count = await db.stamps.count();

  // Fresh user: seed all defaults
  if (count === 0) {
    await db.stamps.bulkAdd(DEFAULT_STAMPS as Stamp[]);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STAMPS_VERSION_KEY, String(STAMPS_VERSION));
    }
    return;
  }

  // Existing user: check if defaults need upgrading
  if (typeof localStorage !== "undefined") {
    const stored = parseInt(localStorage.getItem(STAMPS_VERSION_KEY) || "0", 10);
    if (stored < STAMPS_VERSION) {
      // Replace only default stamps, preserve user-created custom stamps
      const existing = await db.stamps.toArray();
      const customStamps = existing.filter((s) => !s.isDefault);
      await db.stamps.clear();
      // Re-add new defaults
      await db.stamps.bulkAdd(DEFAULT_STAMPS as Stamp[]);
      // Re-add custom stamps with updated sortOrder
      if (customStamps.length > 0) {
        const offset = DEFAULT_STAMPS.length;
        const reindexed = customStamps.map((s, i) => ({
          ...s,
          id: undefined,
          sortOrder: offset + i,
        }));
        await db.stamps.bulkAdd(reindexed as Stamp[]);
      }
      localStorage.setItem(STAMPS_VERSION_KEY, String(STAMPS_VERSION));
    }
  }
}

export { db };
