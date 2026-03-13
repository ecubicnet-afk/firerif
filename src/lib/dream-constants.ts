import type { Course, Category, Stamp } from "@/types/dream";

export const COURSES: Course[] = [
  {
    id: "aggressive",
    label: "積極コース",
    icon: "🔥",
    multiplier: 6.7275,
    multiplier50: 117.3909,
    annualRate: 0.10,
    indexName: "NASDAQ100",
    color: "text-red-500",
  },
  {
    id: "standard",
    label: "標準コース",
    icon: "🌟",
    multiplier: 4.6610,
    multiplier50: 46.9016,
    annualRate: 0.08,
    indexName: "S&P500",
    color: "text-amber-500",
  },
  {
    id: "conservative",
    label: "堅実コース",
    icon: "🐢",
    multiplier: 2.6533,
    multiplier50: 11.4674,
    annualRate: 0.05,
    indexName: "オルカン",
    color: "text-green-500",
  },
];

export const COURSES_MAP = Object.fromEntries(
  COURSES.map((c) => [c.id, c])
) as Record<Course["id"], Course>;

export const CATEGORIES: Category[] = [
  { id: "food", label: "食費", icon: "🍽️" },
  { id: "entertainment", label: "娯楽", icon: "🎮" },
  { id: "transport", label: "交通費", icon: "🚃" },
  { id: "shopping", label: "買い物", icon: "🛍️" },
  { id: "health", label: "健康", icon: "💪" },
  { id: "other", label: "その他", icon: "📦" },
];

// 30〜50代子育て世帯向け（家計調査データに基づく汎用スタンプ）
export const DEFAULT_STAMPS: Omit<Stamp, "id">[] = [
  { label: "コンビニ回避", icon: "🏪", amount: 500, categoryId: "food", sortOrder: 0, isDefault: true },
  { label: "カフェ我慢", icon: "☕", amount: 400, categoryId: "food", sortOrder: 1, isDefault: true },
  { label: "外食パス", icon: "🍽️", amount: 1500, categoryId: "food", sortOrder: 2, isDefault: true },
  { label: "飲み会パス", icon: "🍺", amount: 4000, categoryId: "entertainment", sortOrder: 3, isDefault: true },
  { label: "ネット通販我慢", icon: "📦", amount: 3000, categoryId: "shopping", sortOrder: 4, isDefault: true },
  { label: "自炊した！", icon: "🍳", amount: 800, categoryId: "food", sortOrder: 5, isDefault: true },
  { label: "水筒持参", icon: "🫗", amount: 150, categoryId: "food", sortOrder: 6, isDefault: true },
  { label: "お菓子我慢", icon: "🍫", amount: 300, categoryId: "food", sortOrder: 7, isDefault: true },
  { label: "歩いた！", icon: "🚶", amount: 500, categoryId: "transport", sortOrder: 8, isDefault: true },
  { label: "サブスク見直し", icon: "📱", amount: 1000, categoryId: "entertainment", sortOrder: 9, isDefault: true },
  { label: "衝動買い回避", icon: "🛍️", amount: 2000, categoryId: "shopping", sortOrder: 10, isDefault: true },
  { label: "家族レジャー節約", icon: "🎪", amount: 3000, categoryId: "entertainment", sortOrder: 11, isDefault: true },
];
