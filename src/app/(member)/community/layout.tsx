import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "コミュニティ",
  description: "同じ目標を持つ仲間と交流。情報交換やモチベーション維持に活用しましょう。",
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
