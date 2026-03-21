"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Video,
  Radio,
  MessageCircleQuestion,
  Wallet,
  Sparkles,
  TrendingUp,
  Target,
  CheckSquare,
  Users,
  CalendarRange,
  ClipboardCheck,
  BookOpen,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/courses", label: "動画コース", icon: Video },
  { href: "/live", label: "ライブ配信", icon: Radio },
  { href: "/qa", label: "Q&A", icon: MessageCircleQuestion },
  { href: "/budget", label: "家計簿", icon: Wallet },
  { href: "/dream", label: "節約ドリーム", icon: Sparkles },
  { href: "/assets", label: "資産管理", icon: TrendingUp },
  { href: "/vision", label: "ビジョンボード", icon: Target },
  { href: "/life-plan", label: "ライフプラン", icon: CalendarRange },
  { href: "/todos", label: "ToDoリスト", icon: CheckSquare },
  { href: "/assignments", label: "課題提出", icon: ClipboardCheck },
  { href: "/journal", label: "節約ジャーナル", icon: BookOpen },
  { href: "/community", label: "コミュニティ", icon: Users },
];

function useVisibleNavItems() {
  return navItems;
}

export function Sidebar() {
  const pathname = usePathname();
  const visibleItems = useVisibleNavItems();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40 p-4">
      <nav className="space-y-1">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const visibleItems = useVisibleNavItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="flex overflow-x-auto">
        {visibleItems.slice(0, 6).map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] min-w-0 overflow-hidden",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate max-w-full px-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
