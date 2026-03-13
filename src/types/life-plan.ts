export interface LifePlanInput {
  // 基本情報
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;

  // 家族
  spouse: { age: number; retirementAge: number } | null;
  children: { age: number }[];

  // 収入
  annualIncome: number;        // 手取り年収（万円）
  salaryGrowthRate: number;    // 昇給率（%）
  spouseIncome: number;        // 配偶者年収（万円）
  pensionStartAge: number;     // 年金受給開始年齢
  monthlyPension: number;      // 月額年金（万円）
  spousePensionStartAge: number;
  spouseMonthlyPension: number;

  // 住居
  housing: {
    type: "rent" | "own";
    monthlyRent?: number;      // 月額家賃（万円）
    renewalFee?: number;       // 更新料（万円、2年ごと）
    loanBalance?: number;      // ローン残高（万円）
    loanRate?: number;         // 金利（%）
    loanYearsLeft?: number;    // 残期間（年）
    propertyTax?: number;      // 固定資産税/年（万円）
    maintenanceCost?: number;  // 修繕積立/年（万円）
  };

  // ライフイベント
  events: LifeEvent[];

  // 生活費
  annualLivingCost: number;        // 退職前生活費/年（万円）
  retiredLivingCostRatio: number;  // 退職後生活費比率（0.0-1.0）
  inflationRate: number;           // インフレ率（%）

  // 資産
  currentAssets: number;       // 現在の金融資産（万円）
  investmentReturn: number;    // 想定運用利回り（%）
}

export type LifeEventType =
  | "car"
  | "travel"
  | "education"
  | "wedding"
  | "renovation"
  | "care"
  | "other";

export interface LifeEvent {
  id: string;
  type: LifeEventType;
  label: string;
  amount: number;          // 金額（万円）
  ageAtEvent: number;      // 発生する年齢
  isRecurring: boolean;
  intervalYears?: number;  // 繰り返し間隔（年）
}

export interface YearlyProjection {
  age: number;
  year: number;
  income: number;
  expense: number;
  housingCost: number;
  eventCost: number;
  educationCost: number;
  investmentReturn: number;
  cashFlow: number;
  netWorth: number;
  milestones: string[];
}

export interface LifePlanSummary {
  totalLifetimeIncome: number;
  totalLifetimeExpense: number;
  finalNetWorth: number;
  shortfallAge: number | null;     // 資産がマイナスになる年齢
  shortfallAmount: number | null;  // 最大不足額
  retirementNetWorth: number;      // 退職時の資産
}
