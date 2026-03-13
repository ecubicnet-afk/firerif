import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ToDoリスト",
  description: "FIRE達成に向けたタスクを管理。やるべきことを整理して着実に前進しましょう。",
};

export default function TodosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
