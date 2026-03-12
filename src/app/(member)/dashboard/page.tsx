"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Video,
  Radio,
  MessageCircleQuestion,
  Wallet,
  Sparkles,
  TrendingUp,
  Target,
  CheckSquare,
  Users,
  CreditCard,
} from "lucide-react";

const quickLinks = [
  { href: "/courses", label: "動画コース", icon: Video, color: "text-blue-500" },
  { href: "/live", label: "ライブ配信", icon: Radio, color: "text-red-500" },
  { href: "/qa", label: "Q&A", icon: MessageCircleQuestion, color: "text-purple-500" },
  { href: "/budget", label: "家計簿", icon: Wallet, color: "text-green-500" },
  { href: "/dream", label: "節約ドリーム", icon: Sparkles, color: "text-amber-500" },
  { href: "/assets", label: "資産管理", icon: TrendingUp, color: "text-orange-500" },
  { href: "/vision", label: "ビジョンボード", icon: Target, color: "text-pink-500" },
  { href: "/todos", label: "ToDoリスト", icon: CheckSquare, color: "text-cyan-500" },
  { href: "/community", label: "コミュニティ", icon: Users, color: "text-indigo-500" },
];

export default function DashboardPage() {
  const { data: session } = useSession();

  async function handleManageBilling() {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("エラーが発生しました");
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          ようこそ、{session?.user?.name || "メンバー"}さん
        </h1>
        <p className="text-muted-foreground mt-1">
          ファイヤーライフコミュニティへようこそ。FIREへの道を一緒に歩みましょう。
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                <link.icon className={`h-8 w-8 ${link.color}`} />
                <span className="text-sm font-medium">{link.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>お知らせ</CardTitle>
          <CardDescription>最新のコミュニティニュース</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            ファイヤーライフコミュニティへようこそ！動画コースやライブ配信をお楽しみください。
            質問があればQ&Aページから投稿できます。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            サブスクリプション管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleManageBilling}>
            請求・支払い管理
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
