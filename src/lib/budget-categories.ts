// 家計ノート風カテゴリ分類

export type ExpenseGroup = "変動費" | "特別出費" | "固定費";

export const LIVING_EXPENSE_CATEGORIES = [
  "食費", "日用品", "衣服・美容費", "趣味・娯楽", "交通費",
  "教育費", "医療費", "交際費", "こづかい", "その他",
] as const;

export const FIXED_COST_CATEGORIES = [
  "住居費", "電気代", "ガス代", "水道代", "通信費", "保険", "ローン返済",
] as const;

export const SPECIAL_EXPENSE_CATEGORIES = [
  "特別出費",
] as const;

export const INCOME_CATEGORIES = [
  "給与", "副業", "投資収入", "配当金", "その他収入",
] as const;

export const SAVING_CATEGORIES = [
  "預金", "NISA", "iDeCo", "投資信託", "その他貯蓄",
] as const;

// All expense categories (for forms)
export const ALL_EXPENSE_CATEGORIES = [
  ...LIVING_EXPENSE_CATEGORIES,
  ...FIXED_COST_CATEGORIES,
  ...SPECIAL_EXPENSE_CATEGORIES,
] as const;

// Backward-compatible mapping for old categories
const LEGACY_MAPPING: Record<string, ExpenseGroup> = {
  "光熱費": "固定費",
  "衣服": "変動費",
  "その他支出": "変動費",
};

const LIVING_SET = new Set<string>(LIVING_EXPENSE_CATEGORIES);
const FIXED_SET = new Set<string>(FIXED_COST_CATEGORIES);
const SPECIAL_SET = new Set<string>(SPECIAL_EXPENSE_CATEGORIES);

export function getExpenseGroup(category: string): ExpenseGroup {
  if (LEGACY_MAPPING[category]) return LEGACY_MAPPING[category];
  if (LIVING_SET.has(category)) return "変動費";
  if (FIXED_SET.has(category)) return "固定費";
  if (SPECIAL_SET.has(category)) return "特別出費";
  // Unknown categories default to 変動費
  return "変動費";
}

export const EXPENSE_GROUP_CONFIG: Record<ExpenseGroup, { color: string; label: string }> = {
  "変動費": { color: "text-orange-600", label: "変動費" },
  "固定費": { color: "text-blue-600", label: "固定費" },
  "特別出費": { color: "text-purple-600", label: "特別出費" },
};
