import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "資産管理",
  description: "NISA・iDeCo・預金など全ての資産を一元管理。ポートフォリオの推移をグラフで確認。",
};

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
