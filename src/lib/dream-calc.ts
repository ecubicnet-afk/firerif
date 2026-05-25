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

/**
 * 進捗に応じた写真フィルター。
 * 節約が進むほど「ぼかしが取れて・モノクロ→フルカラーに色づき・明るく鮮やかになる」。
 * ぼかし単体より変化がドラマチックで、"演出"だと一目で分かる。
 */
export function dreamFilter(progress: number): string {
  const p = Math.min(Math.max(progress, 0), 1);
  const blur = (MAX_BLUR * (1 - p)).toFixed(1);
  const gray = (0.85 * (1 - p)).toFixed(2); // 0%:ほぼモノクロ → 100%:フルカラー
  const bright = (0.72 + 0.28 * p).toFixed(2); // 0%:暗い → 100%:明るい
  const sat = (0.5 + 0.7 * p).toFixed(2); // 0%:くすむ → 100%:鮮やか
  return `blur(${blur}px) grayscale(${gray}) brightness(${bright}) saturate(${sat})`;
}

/** マウント時の初期表示（完全ロック）。ここから現在の進捗まで一気にピントが合う演出に使う。 */
export const DREAM_FILTER_LOCKED = `blur(${MAX_BLUR}px) grayscale(0.9) brightness(0.55) saturate(0.35)`;
