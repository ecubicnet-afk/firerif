import type { Course, Category, Stamp } from "@/types/dream";

export const COURSES: Course[] = [
  {
    id: "aggressive",
    label: "積極コース",
    icon: "🔥",
    multiplier: 6.7275,
    annualRate: 0.10,
    indexName: "NASDAQ100",
    color: "text-red-500",
  },
  {
    id: "standard",
    label: "標準コース",
    icon: "🌟",
    multiplier: 4.6610,
    annualRate: 0.08,
    indexName: "S&P500",
    color: "text-amber-500",
  },
  {
    id: "conservative",
    label: "堅実コース",
    icon: "🐢",
    multiplier: 2.6533,
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

export const DEFAULT_STAMPS: Omit<Stamp, "id">[] = [
  { label: "カフェ我慢", icon: "☕", amount: 400, categoryId: "food", sortOrder: 0, isDefault: true },
  { label: "飲み会パス", icon: "🍺", amount: 4000, categoryId: "entertainment", sortOrder: 1, isDefault: true },
  { label: "コンビニ回避", icon: "🍱", amount: 600, categoryId: "food", sortOrder: 2, isDefault: true },
  { label: "歩いた！", icon: "🚕", amount: 1000, categoryId: "transport", sortOrder: 3, isDefault: true },
  { label: "衝動買い回避", icon: "🛍️", amount: 2000, categoryId: "shopping", sortOrder: 4, isDefault: true },
  { label: "課金我慢", icon: "🎮", amount: 500, categoryId: "entertainment", sortOrder: 5, isDefault: true },
];
