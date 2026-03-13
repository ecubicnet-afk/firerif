import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "家計簿",
  description: "毎月の収支を記録して節約の成果を見える化。カテゴリ別に収入・支出を管理できます。",
};

export default function BudgetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
