import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "節約ドリーム",
  description: "日々の節約を楽しく記録。スタンプを集めてモチベーションをキープしましょう。",
};

export default function DreamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
