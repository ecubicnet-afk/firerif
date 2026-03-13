import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ライブ配信",
  description: "月2回のライブ配信で最新情報をキャッチ。リアルタイムで質問もできます。",
};

export default function LiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
