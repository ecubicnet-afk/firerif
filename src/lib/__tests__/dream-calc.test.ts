import { describe, it, expect } from "vitest";
import { calculateFV, futureValue, futureValue50, multiplierForYears, totalSavings, dreamProgress, blurLevel } from "../dream-calc";
import { DEFAULT_STAMPS, COURSES, COURSES_MAP } from "../dream-constants";

// ── 複利計算式 FV = PMT × ((1 + r)^n - 1) / r の数学的正確性 ──

describe("calculateFV (複利計算)", () => {
  it("年利7%, 20年, ¥800 → 数学的に正しい値", () => {
    // FV = 800 × ((1.07^20 - 1) / 0.07)
    // 1.07^20 = 3.86968...
    // (3.86968 - 1) / 0.07 = 40.9953...
    // 800 × 40.9953 = 32796.2...
    const result = calculateFV(800, 0.07, 20);
    expect(result).toBe(Math.round(800 * ((Math.pow(1.07, 20) - 1) / 0.07)));
    expect(result).toBeGreaterThan(32000);
    expect(result).toBeLessThan(33000);
  });

  it("年利7%, 50年, ¥5000 → 数学的に正しい値", () => {
    // FV = 5000 × ((1.07^50 - 1) / 0.07)
    // 1.07^50 = 29.4570...
    // (29.4570 - 1) / 0.07 = 406.528...
    // 5000 × 406.528 = 2,032,644
    const result = calculateFV(5000, 0.07, 50);
    expect(result).toBe(Math.round(5000 * ((Math.pow(1.07, 50) - 1) / 0.07)));
    expect(result).toBeGreaterThan(2_000_000);
    expect(result).toBeLessThan(2_100_000);
  });

  it("年利0% → amount × years", () => {
    expect(calculateFV(1000, 0, 20)).toBe(20000);
    expect(calculateFV(500, 0, 50)).toBe(25000);
  });

  it("年利10%, 20年, ¥1000", () => {
    const result = calculateFV(1000, 0.10, 20);
    const expected = Math.round(1000 * ((Math.pow(1.10, 20) - 1) / 0.10));
    expect(result).toBe(expected);
  });

  it("年利5%, 50年, ¥100", () => {
    const result = calculateFV(100, 0.05, 50);
    const expected = Math.round(100 * ((Math.pow(1.05, 50) - 1) / 0.05));
    expect(result).toBe(expected);
  });

  it("年利8%, 20年, ¥3000", () => {
    const result = calculateFV(3000, 0.08, 20);
    const expected = Math.round(3000 * ((Math.pow(1.08, 20) - 1) / 0.08));
    expect(result).toBe(expected);
  });
});

// ── 各コース別のFV検証 ──

describe("futureValue / futureValue50 (コース別)", () => {
  const testCases: Array<{ courseId: "aggressive" | "standard" | "balanced" | "conservative"; amount: number }> = [
    { courseId: "aggressive", amount: 1000 },
    { courseId: "standard", amount: 1000 },
    { courseId: "balanced", amount: 1000 },
    { courseId: "conservative", amount: 1000 },
  ];

  for (const { courseId, amount } of testCases) {
    const course = COURSES_MAP[courseId];

    it(`${course.label}: ¥${amount} の10年後FV`, () => {
      const result = futureValue(amount, courseId);
      const expected = Math.round(amount * ((Math.pow(1 + course.annualRate, 10) - 1) / course.annualRate));
      expect(result).toBe(expected);
    });

    it(`${course.label}: ¥${amount} の20年後FV`, () => {
      const result = futureValue50(amount, courseId);
      const expected = Math.round(amount * ((Math.pow(1 + course.annualRate, 20) - 1) / course.annualRate));
      expect(result).toBe(expected);
    });
  }
});

// ── multiplierForYears ──

describe("multiplierForYears", () => {
  it("年利7%, 20年の倍率", () => {
    const mult = multiplierForYears(0.07, 20);
    // (1.07^20 - 1) / 0.07 ≈ 40.995
    expect(mult).toBeCloseTo(40.995, 1);
  });

  it("年利7%, 50年の倍率", () => {
    const mult = multiplierForYears(0.07, 50);
    // (1.07^50 - 1) / 0.07 ≈ 406.53
    expect(mult).toBeCloseTo(406.53, 0);
  });

  it("年利0%の場合はyearsを返す", () => {
    expect(multiplierForYears(0, 20)).toBe(20);
    expect(multiplierForYears(0, 50)).toBe(50);
  });
});

// ── DEFAULT_STAMPS データ整合性 ──

describe("DEFAULT_STAMPS (20項目)", () => {
  it("20個のスタンプが定義されている", () => {
    expect(DEFAULT_STAMPS).toHaveLength(20);
  });

  it("全スタンプにlabel, icon, amount, categoryId, notificationMessageが存在する", () => {
    for (const stamp of DEFAULT_STAMPS) {
      expect(stamp.label).toBeTruthy();
      expect(stamp.icon).toBeTruthy();
      expect(stamp.amount).toBeGreaterThan(0);
      expect(stamp.categoryId).toBeTruthy();
      expect(stamp.notificationMessage).toBeTruthy();
      expect(stamp.isDefault).toBe(true);
    }
  });

  it("sortOrderが0から19まで連番", () => {
    for (let i = 0; i < 20; i++) {
      expect(DEFAULT_STAMPS[i].sortOrder).toBe(i);
    }
  });

  it("指定された金額と一致する", () => {
    const expectedAmounts: Record<string, number> = {
      "自炊弁当": 800,
      "晩酌休み": 300,
      "自宅ドリップ": 150,
      "レジ横スイーツ": 200,
      "自販機スルー": 160,
      "一駅歩き": 200,
      "タクシー回避": 4000,
      "手数料回避": 500,
      "クリーニング自宅": 1000,
      "レジ袋パス": 10,
      "サブスク解約": 1000,
      "ガチャ我慢": 3000,
      "ATM手数料": 220,
      "図書館利用": 1500,
      "格安プラン": 3000,
      "二次会パス": 3000,
      "衝動買い我慢": 5000,
      "セールスルー": 10000,
      "ホムパ化": 2000,
      "節電意識": 100,
    };

    for (const stamp of DEFAULT_STAMPS) {
      expect(stamp.amount).toBe(expectedAmounts[stamp.label]);
    }
  });

  it("通知メッセージに説教臭いトーンがない（「しなさい」「べき」「ダメ」を含まない）", () => {
    const ngWords = ["しなさい", "べきです", "べきだ", "ダメです", "いけません", "禁止"];
    for (const stamp of DEFAULT_STAMPS) {
      for (const ng of ngWords) {
        expect(stamp.notificationMessage).not.toContain(ng);
      }
    }
  });
});

// ── COURSESの検証 ──

describe("COURSES", () => {
  it("4つのコースが定義されている", () => {
    expect(COURSES).toHaveLength(4);
  });

  it("balanced コース（デフォルト年利7%）が含まれる", () => {
    const balanced = COURSES_MAP["balanced"];
    expect(balanced).toBeDefined();
    expect(balanced.annualRate).toBe(0.07);
    expect(balanced.label).toBe("バランスコース");
  });
});

// ── ユーティリティ関数 ──

describe("totalSavings / dreamProgress / blurLevel", () => {
  it("totalSavings: 合計額を正しく計算", () => {
    const entries = [
      { id: 1, date: "2026-01-01", timestamp: 0, amount: 800, categoryId: "food", stampId: null, label: "test", icon: "🍱" },
      { id: 2, date: "2026-01-02", timestamp: 0, amount: 300, categoryId: "food", stampId: null, label: "test", icon: "🍺" },
    ];
    expect(totalSavings(entries)).toBe(1100);
  });

  it("dreamProgress: 正しい進捗率", () => {
    expect(dreamProgress(50000, 100000)).toBe(0.5);
    expect(dreamProgress(100000, 100000)).toBe(1);
    expect(dreamProgress(0, 100000)).toBe(0);
    expect(dreamProgress(100, 0)).toBe(0);
  });

  it("blurLevel: 進捗に応じたブラー値", () => {
    expect(blurLevel(0)).toBe(12);
    expect(blurLevel(0.5)).toBe(6);
    expect(blurLevel(1)).toBe(0);
    expect(blurLevel(2)).toBe(0); // clamp at 0
  });
});

// ── 具体的なFV計算の検算 ──

describe("具体的なスタンプのFV検算", () => {
  it("自炊弁当 ¥800 × バランスコース(7%) × 10年", () => {
    const fv = futureValue(800, "balanced");
    // 800 × ((1.07^10 - 1) / 0.07) ≈ 800 × 13.816 ≈ 11,053
    const expected = Math.round(800 * ((Math.pow(1.07, 10) - 1) / 0.07));
    expect(fv).toBe(expected);
  });

  it("セールスルー ¥10000 × 積極コース(10%) × 20年", () => {
    const fv = futureValue50(10000, "aggressive");
    // 10000 × ((1.10^20 - 1) / 0.10) = 10000 × 57.275 ≈ 572,750
    const expected = Math.round(10000 * ((Math.pow(1.10, 20) - 1) / 0.10));
    expect(fv).toBe(expected);
  });

  it("レジ袋パス ¥10 × 堅実コース(5%) × 10年", () => {
    const fv = futureValue(10, "conservative");
    // 10 × ((1.05^10 - 1) / 0.05) = 10 × 12.578 ≈ 126
    const expected = Math.round(10 * ((Math.pow(1.05, 10) - 1) / 0.05));
    expect(fv).toBe(expected);
  });

  it("衝動買い我慢 ¥5000 × バランスコース(7%) × 20年", () => {
    const fv = futureValue50(5000, "balanced");
    // 5000 × ((1.07^20 - 1) / 0.07) ≈ 5000 × 40.995 ≈ 204,977
    const expected = Math.round(5000 * ((Math.pow(1.07, 20) - 1) / 0.07));
    expect(fv).toBe(expected);
  });
});
