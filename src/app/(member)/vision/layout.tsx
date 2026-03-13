import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ビジョンボード",
  description: "FIRE後の理想の生活を具体的にイメージ。目標金額と達成期日を設定して夢を可視化。",
};

export default function VisionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
