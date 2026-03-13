import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Q&A",
  description: "会員からの質問に動画で丁寧に回答。過去のQ&Aも検索して参考にできます。",
};

export default function QaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
