import { describe, it, expect } from "vitest";
import {
  annualMortgagePayment,
  calculateEducationCost,
  calculateHousingCost,
  calculateEventCost,
  simulateLifePlan,
  summarizeLifePlan,
} from "../life-plan-calc";
import { DEFAULT_LIFE_PLAN } from "../life-plan-constants";
import type { LifePlanInput } from "@/types/life-plan";

describe("annualMortgagePayment", () => {
  it("ゼロ金利の場合、元金均等", () => {
    expect(annualMortgagePayment(3000, 0, 30)).toBe(100);
  });

  it("残高ゼロなら返済額ゼロ", () => {
    expect(annualMortgagePayment(0, 1.5, 30)).toBe(0);
  });

  it("残期間ゼロなら返済額ゼロ", () => {
    expect(annualMortgagePayment(3000, 1.5, 0)).toBe(0);
  });

  it("3000万円・1.5%・30年で正しい年間返済額", () => {
    const payment = annualMortgagePayment(3000, 1.5, 30);
    // 元利均等: 3000 × 0.015 × 1.015^30 / (1.015^30 - 1) ≈ 124.8万円
    expect(payment).toBeCloseTo(124.8, 0);
  });
});

describe("calculateEducationCost", () => {
  it("子供が6歳の時に小学校の教育費が発生", () => {
    const result = calculateEducationCost([{ age: 5 }], 1);
    expect(result.cost).toBe(35);
    expect(result.milestones).toContain("子供小学校入学");
  });

  it("子供が18歳の時に大学入学", () => {
    const result = calculateEducationCost([{ age: 15 }], 3);
    expect(result.cost).toBe(120);
    expect(result.milestones).toContain("子供大学入学");
  });

  it("教育費対象外の年齢では0", () => {
    const result = calculateEducationCost([{ age: 25 }], 0);
    expect(result.cost).toBe(0);
  });

  it("複数の子供の教育費を合算", () => {
    const result = calculateEducationCost([{ age: 6 }, { age: 12 }], 0);
    expect(result.cost).toBe(35 + 50); // 小学校 + 中学校
  });

  it("複数の子供のラベルに番号が付く", () => {
    const result = calculateEducationCost([{ age: 5 }, { age: 5 }], 1);
    expect(result.milestones).toContain("第1子小学校入学");
    expect(result.milestones).toContain("第2子小学校入学");
  });
});

describe("calculateHousingCost", () => {
  it("賃貸: 月額10万+更新料10万(2年ごと) = 年125万", () => {
    const input: LifePlanInput = {
      ...DEFAULT_LIFE_PLAN,
      housing: { type: "rent", monthlyRent: 10, renewalFee: 10 },
    };
    expect(calculateHousingCost(input, 0)).toBe(125);
  });

  it("持ち家: ローン返済中", () => {
    const input: LifePlanInput = {
      ...DEFAULT_LIFE_PLAN,
      housing: {
        type: "own",
        loanBalance: 3000,
        loanRate: 1.5,
        loanYearsLeft: 30,
        propertyTax: 15,
        maintenanceCost: 12,
      },
    };
    const cost = calculateHousingCost(input, 0);
    // ローン返済 ≈ 124.8 + 固定資産税15 + 修繕12 ≈ 151.8
    expect(cost).toBeCloseTo(151.8, 0);
  });

  it("持ち家: ローン完済後は税+修繕のみ", () => {
    const input: LifePlanInput = {
      ...DEFAULT_LIFE_PLAN,
      housing: {
        type: "own",
        loanBalance: 3000,
        loanRate: 1.5,
        loanYearsLeft: 10,
        propertyTax: 15,
        maintenanceCost: 12,
      },
    };
    // 10年後（完済後）
    expect(calculateHousingCost(input, 10)).toBe(27);
  });
});

describe("calculateEventCost", () => {
  it("一回限りのイベント", () => {
    const input: LifePlanInput = {
      ...DEFAULT_LIFE_PLAN,
      currentAge: 35,
      events: [
        {
          id: "1",
          type: "wedding",
          label: "結婚",
          amount: 300,
          ageAtEvent: 37,
          isRecurring: false,
        },
      ],
    };
    expect(calculateEventCost(input, 2).cost).toBe(300);
    expect(calculateEventCost(input, 3).cost).toBe(0);
  });

  it("繰り返しイベント（8年ごとの車購入）", () => {
    const input: LifePlanInput = {
      ...DEFAULT_LIFE_PLAN,
      currentAge: 30,
      events: [
        {
          id: "1",
          type: "car",
          label: "車購入",
          amount: 300,
          ageAtEvent: 30,
          isRecurring: true,
          intervalYears: 8,
        },
      ],
    };
    expect(calculateEventCost(input, 0).cost).toBe(300);
    expect(calculateEventCost(input, 4).cost).toBe(0);
    expect(calculateEventCost(input, 8).cost).toBe(300);
    expect(calculateEventCost(input, 16).cost).toBe(300);
  });
});

describe("simulateLifePlan", () => {
  it("想定寿命まで正確な年数のプロジェクションを生成", () => {
    const input: LifePlanInput = {
      ...DEFAULT_LIFE_PLAN,
      currentAge: 30,
      lifeExpectancy: 90,
    };
    const projections = simulateLifePlan(input);
    expect(projections.length).toBe(61); // 30歳〜90歳 = 61年分
    expect(projections[0].age).toBe(30);
    expect(projections[60].age).toBe(90);
  });

  it("退職後は給与が0になり年金が開始", () => {
    const input: LifePlanInput = {
      ...DEFAULT_LIFE_PLAN,
      currentAge: 60,
      retirementAge: 65,
      pensionStartAge: 65,
      monthlyPension: 15,
      lifeExpectancy: 70,
    };
    const projections = simulateLifePlan(input);

    // 60歳: 給与あり
    expect(projections[0].income).toBeGreaterThan(0);

    // 65歳: 退職 + 年金開始
    const at65 = projections.find((p) => p.age === 65)!;
    expect(at65.milestones).toContain("退職");
    expect(at65.milestones).toContain("年金受給開始");
    expect(at65.income).toBe(15 * 12); // 年金のみ
  });

  it("インフレ率が生活費に複利で適用される", () => {
    const input: LifePlanInput = {
      ...DEFAULT_LIFE_PLAN,
      currentAge: 30,
      annualLivingCost: 300,
      inflationRate: 2.0,
      lifeExpectancy: 50,
    };
    const projections = simulateLifePlan(input);

    // 20年後: 300 × 1.02^20 ≈ 445
    expect(projections[20].expense).toBeCloseTo(445, -1);
  });

  it("資産がプラスの時のみ投資リターンが発生", () => {
    const input: LifePlanInput = {
      ...DEFAULT_LIFE_PLAN,
      currentAge: 30,
      currentAssets: 100,
      investmentReturn: 5.0,
      lifeExpectancy: 32,
    };
    const projections = simulateLifePlan(input);

    // 初年度: 100 × 5% = 5万の投資リターン
    expect(projections[0].investmentReturn).toBe(5);
  });
});

describe("summarizeLifePlan", () => {
  it("サマリーが正しく計算される", () => {
    const input: LifePlanInput = {
      ...DEFAULT_LIFE_PLAN,
      currentAge: 30,
      lifeExpectancy: 90,
    };
    const projections = simulateLifePlan(input);
    const summary = summarizeLifePlan(input, projections);

    expect(summary.totalLifetimeIncome).toBeGreaterThan(0);
    expect(summary.totalLifetimeExpense).toBeGreaterThan(0);
    expect(summary.retirementNetWorth).toBeDefined();
  });

  it("資産が常にプラスならshortfallはnull", () => {
    const input: LifePlanInput = {
      ...DEFAULT_LIFE_PLAN,
      currentAge: 30,
      currentAssets: 50000, // 5億円
      lifeExpectancy: 90,
    };
    const projections = simulateLifePlan(input);
    const summary = summarizeLifePlan(input, projections);

    expect(summary.shortfallAge).toBeNull();
    expect(summary.shortfallAmount).toBeNull();
  });

  it("資産不足時にshortfallが検出される", () => {
    const input: LifePlanInput = {
      ...DEFAULT_LIFE_PLAN,
      currentAge: 30,
      currentAssets: 0,
      annualIncome: 100,
      annualLivingCost: 400,
      investmentReturn: 0,
      lifeExpectancy: 90,
    };
    const projections = simulateLifePlan(input);
    const summary = summarizeLifePlan(input, projections);

    expect(summary.shortfallAge).not.toBeNull();
    expect(summary.shortfallAmount).toBeGreaterThan(0);
  });
});
