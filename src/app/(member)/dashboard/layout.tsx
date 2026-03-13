import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ダッシュボード",
  description: "あなたのFIRE達成状況を一覧で確認。資産・家計・目標の進捗をまとめて表示します。",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
