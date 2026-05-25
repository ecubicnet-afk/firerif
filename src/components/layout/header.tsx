"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Flame,
  LogOut,
  Menu,
  X,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { navItems } from "./sidebar";

export function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoading = status === "loading";

  const openBillingPortal = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "お支払いページを開けませんでした");
      }
    } catch {
      alert("お支払いページを開けませんでした");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2 font-bold text-lg">
          <Flame className="h-6 w-6 text-primary" />
          <span>ファイアライフBASE</span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-auto hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          ) : session ? (
            <>
              <span className="text-sm text-muted-foreground">
                {session.user.name || session.user.email}
              </span>
              {session.user.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="outline" size="sm">
                    管理画面
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={openBillingPortal}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                お支払い・解約
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4 mr-1" />
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  ログイン
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">今すぐ参加</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="ml-auto md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t p-4 space-y-2 bg-background">
          {isLoading ? (
            <div className="h-6 w-24 bg-muted animate-pulse rounded mx-2" />
          ) : session ? (
            <>
              <p className="text-sm text-muted-foreground px-2">
                {session.user.name || session.user.email}
              </p>
              {/* ページナビ（下部ナビに載らないライブ配信・資産管理もここから到達できる） */}
              <nav className="grid grid-cols-2 gap-1 border-b pb-2 mb-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="block px-2 py-1 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  管理画面
                </Link>
              )}
              <button
                className="block px-2 py-1 text-sm w-full text-left"
                onClick={openBillingPortal}
              >
                お支払い・解約
              </button>
              <button
                className="block px-2 py-1 text-sm text-destructive"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                ログアウト
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-2 py-1 text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                ログイン
              </Link>
              <Link
                href="/register"
                className="block px-2 py-1 text-sm text-primary font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                今すぐ参加
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
