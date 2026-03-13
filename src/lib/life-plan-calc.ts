import type {
  LifePlanInput,
  YearlyProjection,
  LifePlanSummary,
} from "@/types/life-plan";
import { EDUCATION_COST_BY_AGE } from "./life-plan-constants";

/**
 * 元利均等返済の年間返済額を計算
 * PMT = P × r(1+r)^n / ((1+r)^n - 1)
 */
export function annualMortgagePayment(
  balance: number,
  annualRate: number,
  yearsLeft: number
): number {
  if (yearsLeft <= 0 || balance <= 0) return 0;
  if (annualRate === 0) return balance / yearsLeft;
  const r = annualRate / 100;
  const n = yearsLeft;
  return balance * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/**
 * 子供全員の教育費を計算（万円）
 */
export function calculateEducationCost(
  children: { age: number }[],
  yearsFromNow: number
): { cost: number; milestones: string[] } {
  let cost = 0;
  const milestones: string[] = [];

  for (let i = 0; i < children.length; i++) {
    const childAge = children[i].age + yearsFromNow;
    const entry = EDUCATION_COST_BY_AGE[childAge];
    if (entry) {
      cost += entry.cost;
    }
    // マイルストーン
    const childLabel = children.length > 1 ? `第${i + 1}子` : "子供";
    if (childAge === 3) milestones.push(`${childLabel}幼稚園入園`);
    if (childAge === 6) milestones.push(`${childLabel}小学校入学`);
    if (childAge === 12) milestones.push(`${childLabel}中学校入学`);
    if (childAge === 15) milestones.push(`${childLabel}高校入学`);
    if (childAge === 18) milestones.push(`${childLabel}大学入学`);
    if (childAge === 22) milestones.push(`${childLabel}大学卒業`);
  }

  return { cost, milestones };
}

/**
 * 年間住居費を計算（万円）
 */
export function calculateHousingCost(
  input: LifePlanInput,
  yearsFromNow: number
): number {
  const h = input.housing;
  if (h.type === "rent") {
    const rent = (h.monthlyRent ?? 0) * 12;
    // 2年ごとの更新料を年割
    const renewal = (h.renewalFee ?? 0) / 2;
    return rent + renewal;
  }

  // 持ち家
  const loanYearsLeft = h.loanYearsLeft ?? 0;
  const propertyTax = h.propertyTax ?? 0;
  const maintenance = h.maintenanceCost ?? 0;

  if (yearsFromNow < loanYearsLeft) {
    const payment = annualMortgagePayment(
      h.loanBalance ?? 0,
      h.loanRate ?? 0,
      loanYearsLeft
    );
    return payment + propertyTax + maintenance;
  }

  // ローン完済後
  return propertyTax + maintenance;
}

/**
 * その年に発生するライフイベントの合計費用を計算
 */
export function calculateEventCost(
  input: LifePlanInput,
  yearsFromNow: number
): { cost: number; labels: string[] } {
  let cost = 0;
  const labels: string[] = [];

  for (const event of input.events) {
    const eventYearsFromNow = event.ageAtEvent - input.currentAge;

    if (event.isRecurring && event.intervalYears && event.intervalYears > 0) {
      // 繰り返しイベント
      if (yearsFromNow >= eventYearsFromNow) {
        const diff = yearsFromNow - eventYearsFromNow;
        if (diff % event.intervalYears === 0) {
          cost += event.amount;
          labels.push(event.label);
        }
      }
    } else {
      // 一回限り
      if (yearsFromNow === eventYearsFromNow) {
        cost += event.amount;
        labels.push(event.label);
      }
    }
  }

  return { cost, labels };
}

/**
 * ライフプランシミュレーション
 * 現在の年齢から想定寿命まで年次ループし、キャッシュフローと資産推移を計算
 */
export function simulateLifePlan(input: LifePlanInput): YearlyProjection[] {
  const projections: YearlyProjection[] = [];
  const currentYear = new Date().getFullYear();
  const totalYears = input.lifeExpectancy - input.currentAge;
  let netWorth = input.currentAssets;

  for (let y = 0; y <= totalYears; y++) {
    const age = input.currentAge + y;
    const year = currentYear + y;
    const milestones: string[] = [];

    // ── 収入 ──
    let income = 0;
    if (age < input.retirementAge) {
      // 給与（昇給率を複利で適用）
      income += input.annualIncome * Math.pow(1 + input.salaryGrowthRate / 100, y);
    } else if (age === input.retirementAge) {
      milestones.push("退職");
    }

    if (age >= input.pensionStartAge) {
      income += input.monthlyPension * 12;
      if (age === input.pensionStartAge) milestones.push("年金受給開始");
    }

    // 配偶者収入
    if (input.spouse) {
      const spouseAge = input.spouse.age + y;
      if (spouseAge < input.spouse.retirementAge) {
        income += input.spouseIncome;
      } else if (spouseAge === input.spouse.retirementAge && input.spouseIncome > 0) {
        milestones.push("配偶者退職");
      }
      if (spouseAge >= input.spousePensionStartAge) {
        income += input.spouseMonthlyPension * 12;
        if (spouseAge === input.spousePensionStartAge && input.spouseMonthlyPension > 0) {
          milestones.push("配偶者年金開始");
        }
      }
    }

    // ── 生活費（インフレ適用）──
    const isRetired = age >= input.retirementAge;
    const baseLiving = isRetired
      ? input.annualLivingCost * input.retiredLivingCostRatio
      : input.annualLivingCost;
    const expense = baseLiving * Math.pow(1 + input.inflationRate / 100, y);

    // ── 住居費 ──
    const housingCost = calculateHousingCost(input, y);

    // ローン完済マイルストーン
    if (
      input.housing.type === "own" &&
      input.housing.loanYearsLeft &&
      y === input.housing.loanYearsLeft
    ) {
      milestones.push("住宅ローン完済");
    }

    // ── 教育費 ──
    const edu = calculateEducationCost(input.children, y);
    milestones.push(...edu.milestones);

    // ── ライフイベント ──
    const ev = calculateEventCost(input, y);
    milestones.push(...ev.labels);

    // ── 投資リターン（プラス資産のみ）──
    const investmentReturn = netWorth > 0
      ? netWorth * (input.investmentReturn / 100)
      : 0;

    // ── キャッシュフロー ──
    const cashFlow = income - expense - housingCost - edu.cost - ev.cost + investmentReturn;
    netWorth += cashFlow;

    projections.push({
      age,
      year,
      income: Math.round(income),
      expense: Math.round(expense),
      housingCost: Math.round(housingCost),
      eventCost: Math.round(ev.cost),
      educationCost: Math.round(edu.cost),
      investmentReturn: Math.round(investmentReturn),
      cashFlow: Math.round(cashFlow),
      netWorth: Math.round(netWorth),
      milestones,
    });
  }

  return projections;
}

/**
 * シミュレーション結果のサマリーを生成
 */
export function summarizeLifePlan(
  input: LifePlanInput,
  projections: YearlyProjection[]
): LifePlanSummary {
  const totalLifetimeIncome = projections.reduce((s, p) => s + p.income, 0);
  const totalLifetimeExpense = projections.reduce(
    (s, p) => s + p.expense + p.housingCost + p.eventCost + p.educationCost,
    0
  );
  const finalNetWorth = projections[projections.length - 1]?.netWorth ?? 0;

  // 資産がマイナスになる最初の年齢
  const shortfallProjection = projections.find((p) => p.netWorth < 0);
  const shortfallAge = shortfallProjection?.age ?? null;

  // 最大不足額（最もマイナスが大きい時点）
  const minNetWorth = Math.min(...projections.map((p) => p.netWorth));
  const shortfallAmount = minNetWorth < 0 ? Math.abs(minNetWorth) : null;

  // 退職時の資産
  const retirementProjection = projections.find(
    (p) => p.age === input.retirementAge
  );
  const retirementNetWorth = retirementProjection?.netWorth ?? 0;

  return {
    totalLifetimeIncome,
    totalLifetimeExpense,
    finalNetWorth,
    shortfallAge,
    shortfallAmount,
    retirementNetWorth,
  };
}
