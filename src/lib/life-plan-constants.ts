import type { LifePlanInput, LifeEventType } from "@/types/life-plan";

// ── デフォルト入力値 ─────────────────────────────
export const DEFAULT_LIFE_PLAN: LifePlanInput = {
  currentAge: 35,
  retirementAge: 65,
  lifeExpectancy: 90,
  spouse: null,
  children: [],
  annualIncome: 500,
  salaryGrowthRate: 1.0,
  spouseIncome: 0,
  pensionStartAge: 65,
  monthlyPension: 15,
  spousePensionStartAge: 65,
  spouseMonthlyPension: 0,
  housing: { type: "rent", monthlyRent: 10, renewalFee: 10 },
  events: [],
  annualLivingCost: 300,
  retiredLivingCostRatio: 0.7,
  inflationRate: 1.0,
  currentAssets: 500,
  investmentReturn: 3.0,
};

// ── 教育費テーブル（公立ベース、万円/年）────────────
// 文部科学省「子供の学習費調査」ベース
export const EDUCATION_COST_BY_AGE: Record<number, { label: string; cost: number }> = {
  3: { label: "幼稚園", cost: 30 },
  4: { label: "幼稚園", cost: 30 },
  5: { label: "幼稚園", cost: 30 },
  6: { label: "小学校", cost: 35 },
  7: { label: "小学校", cost: 35 },
  8: { label: "小学校", cost: 35 },
  9: { label: "小学校", cost: 35 },
  10: { label: "小学校", cost: 35 },
  11: { label: "小学校", cost: 35 },
  12: { label: "中学校", cost: 50 },
  13: { label: "中学校", cost: 50 },
  14: { label: "中学校", cost: 50 },
  15: { label: "高校", cost: 50 },
  16: { label: "高校", cost: 50 },
  17: { label: "高校", cost: 50 },
  18: { label: "大学", cost: 120 },
  19: { label: "大学", cost: 120 },
  20: { label: "大学", cost: 120 },
  21: { label: "大学", cost: 120 },
};

// ── ライフイベントプリセット ──────────────────────
export const EVENT_PRESETS: Record<
  LifeEventType,
  { label: string; icon: string; defaultAmount: number; defaultInterval?: number }
> = {
  car: { label: "車購入", icon: "🚗", defaultAmount: 300, defaultInterval: 8 },
  travel: { label: "旅行", icon: "✈️", defaultAmount: 30, defaultInterval: 1 },
  education: { label: "教育費（追加）", icon: "🎓", defaultAmount: 100 },
  wedding: { label: "結婚資金", icon: "💒", defaultAmount: 300 },
  renovation: { label: "リフォーム", icon: "🔨", defaultAmount: 200 },
  care: { label: "介護費用", icon: "🏥", defaultAmount: 500 },
  other: { label: "その他", icon: "📋", defaultAmount: 100 },
};

// ── ウィザードステップ定義 ────────────────────────
export const WIZARD_STEPS = [
  { id: "basic", label: "基本情報", icon: "👤" },
  { id: "family", label: "家族構成", icon: "👨‍👩‍👧‍👦" },
  { id: "income", label: "収入", icon: "💰" },
  { id: "housing", label: "住居", icon: "🏠" },
  { id: "events", label: "ライフイベント", icon: "📅" },
  { id: "assets", label: "資産・生活費", icon: "📊" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

// ── マイルストーンラベル ─────────────────────────
export const MILESTONE_LABELS = {
  retirement: "退職",
  spouseRetirement: "配偶者退職",
  pensionStart: "年金受給開始",
  spousePensionStart: "配偶者年金開始",
  loanPayoff: "住宅ローン完済",
  kindergarten: "幼稚園入園",
  elementary: "小学校入学",
  middleSchool: "中学校入学",
  highSchool: "高校入学",
  university: "大学入学",
  graduation: "大学卒業",
} as const;
