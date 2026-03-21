import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "節約ジャーナル",
  description: "毎日の節約を記録して、FIREへの道を着実に歩もう。",
};

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
