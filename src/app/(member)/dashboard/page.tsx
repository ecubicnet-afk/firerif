"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  BookMarked,
  Video,
  Radio,
  Wallet,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";

// ダッシュボード並び順（仕様 C案・活用ガイド4STEP順）
// 削除対象（ToDo/課題提出/Q&A/節約ジャーナル/ライフプラン/ビジョンボード）は非表示
const quickLinks = [
  { href: "/guide", label: "活用ガイド", desc: "まずはここから", icon: BookMarked },
  { href: "/dream", label: "節約ドリーム", desc: "目標を決める", icon: Sparkles },
  { href: "/community", label: "コミュニティ", desc: "Discordで仲間と", icon: Users },
  { href: "/courses", label: "動画コース", desc: "最強の節約コーチング", icon: Video },
  { href: "/budget", label: "家計簿", desc: "6枠・月末1回", icon: Wallet },
  { href: "/live", label: "ライブ配信", desc: "マネー診断会", icon: Radio },
  { href: "/assets", label: "資産管理", desc: "ポートフォリオ", icon: TrendingUp },
];

// 「お支払い・解約」カードは撤去済み（2026-07-13）:
// 旧実装は閉鎖済みStripeカスタマーポータル(/api/stripe/portal)に接続していた。
// 本ローンチ時にMOSHの解約手順案内へ差し替えて復活させる（正本=会員アプリ_全体診断_2026-07-13.md A-3）

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-brand/5 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          ようこそ、{session?.user?.name || "メンバー"}さん 👋
        </h1>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          ファイアライフBASEへようこそ。「節約で守りを固め、投資で増やす」を、仲間と一緒に。まずは
          <Link href="/guide" className="font-medium text-primary hover:underline"> 活用ガイド </Link>
          から。
        </p>
      </div>

      {/* 今月のあなた（節約ドリーム連動・新規は はじめの一歩） */}
      <DashboardSummary />

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">メニュー</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group">
              <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30">
                <CardContent className="flex items-center gap-4 p-4 md:p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <link.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{link.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{link.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* お知らせ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">お知らせ</CardTitle>
          <CardDescription>最新のコミュニティニュース</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ファイアライフBASEへようこそ！まずは活用ガイドで進め方を確認し、節約ドリームで目標を決めましょう。
            質問・雑談は <span className="font-medium text-foreground">Discord</span> でいつでもどうぞ。
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
