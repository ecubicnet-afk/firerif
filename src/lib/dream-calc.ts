import type { CourseId, SavingsEntry } from "@/types/dream";
import { COURSES_MAP } from "./dream-constants";

const MAX_BLUR = 20;

export function futureValue(amount: number, courseId: CourseId): number {
  return Math.round(amount * COURSES_MAP[courseId].multiplier);
}

export function totalFutureValue(entries: SavingsEntry[], courseId: CourseId): number {
  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  return Math.round(total * COURSES_MAP[courseId].multiplier);
}

export function totalSavings(entries: SavingsEntry[]): number {
  return entries.reduce((sum, e) => sum + e.amount, 0);
}

export function dreamProgress(totalFV: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0;
  return totalFV / targetAmount;
}

export function blurLevel(progress: number): number {
  return Math.max(0, MAX_BLUR * (1 - Math.min(progress, 1)));
}
