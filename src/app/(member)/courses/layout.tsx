import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "動画コース",
  description: "NISAの始め方、投資の基礎、節約マニュアルなど体系的な動画教材で学べます。",
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
