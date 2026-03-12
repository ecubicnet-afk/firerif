import Dexie, { type EntityTable } from "dexie";
import type { SavingsEntry, Stamp, DreamGoal } from "@/types/dream";
import { DEFAULT_STAMPS } from "./dream-constants";

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

export async function seedDefaultStamps() {
  const count = await db.stamps.count();
  if (count === 0) {
    await db.stamps.bulkAdd(DEFAULT_STAMPS as Stamp[]);
  }
}

export { db };
