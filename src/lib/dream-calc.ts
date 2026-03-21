import type { CourseId, SavingsEntry } from "@/types/dream";
import { COURSES_MAP } from "./dream-constants";

const MAX_BLUR = 12;

/**
 * 複利計算式による未来価値 (Future Value of Annuity)
 * FV = PMT × ((1 + r)^n - 1) / r
 *
 * @param amount - 1回の節約額 (PMT)
 * @param annualRate - 年利 (例: 0.07 = 7%)
 * @param years - 運用年数
 * @returns 未来価値（円、整数に丸め）
 */
export function calculateFV(amount: number, annualRate: number, years: number): number {
  if (annualRate === 0) return amount * years;
  return Math.round(amount * ((Math.pow(1 + annualRate, years) - 1) / annualRate));
}

/** コースの年利で10年後のFVを計算 */
export function futureValue(amount: number, courseId: CourseId): number {
  const course = COURSES_MAP[courseId];
  return calculateFV(amount, course.annualRate, 10);
}

/** コースの年利で20年後のFVを計算 */
export function futureValue50(amount: number, courseId: CourseId): number {
  const course = COURSES_MAP[courseId];
  return calculateFV(amount, course.annualRate, 20);
}

/** コースの年利で20年後の倍率を計算 */
export function multiplierForYears(annualRate: number, years: number): number {
  if (annualRate === 0) return years;
  return (Math.pow(1 + annualRate, years) - 1) / annualRate;
}

export function totalFutureValue(entries: SavingsEntry[], courseId: CourseId): number {
  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  return futureValue(total, courseId);
}

export function totalFutureValue50(entries: SavingsEntry[], courseId: CourseId): number {
  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  return futureValue50(total, courseId);
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
