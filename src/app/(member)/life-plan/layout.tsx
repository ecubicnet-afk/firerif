import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ライフプラン",
  description: "将来のライフイベントと家計をシミュレーション。長期的な資金計画を立てましょう。",
};

export default function LifePlanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
