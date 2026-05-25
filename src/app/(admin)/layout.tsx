import { Header } from "@/components/layout/header";
import Link from "next/link";
import { LayoutDashboard, Users, Video, Radio, ArrowLeft } from "lucide-react";

// 管理ナビ（確定サービス：会員/コース/ライブ。Q&A・課題は廃止＝載せない）
const adminNav = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/members", label: "会員", icon: Users },
  { href: "/admin/courses", label: "コース", icon: Video },
  { href: "/admin/live", label: "ライブ", icon: Radio },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="border-b bg-muted/30">
        <nav className="max-w-6xl mx-auto flex items-center gap-1 px-2 md:px-4 overflow-x-auto">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-3 text-sm whitespace-nowrap text-muted-foreground hover:text-primary transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="ml-auto flex items-center gap-1 px-3 py-3 text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            会員サイトへ
          </Link>
        </nav>
      </div>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
