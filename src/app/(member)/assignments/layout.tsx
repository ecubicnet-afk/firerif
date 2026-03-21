import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "課題提出",
  description: "学習課題を確認して提出しましょう。",
};

export default function AssignmentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
