import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ファイヤーライフ コミュニティ",
  description:
    "経済的自立と早期リタイアを目指すコミュニティ。投資・節約・資産管理を学ぼう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
