import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Flame,
  Video,
  Radio,
  Wallet,
  TrendingUp,
  Target,
  MessageCircleQuestion,
  Users,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "動画コース",
    description: "NISAの始め方、投資の基礎、節約マニュアルなど全10回以上の体系的な動画教材",
  },
  {
    icon: Radio,
    title: "月2回のライブ配信",
    description: "リアルタイムで学べるライブ配信。最新の情報や質問にその場でお答えします",
  },
  {
    icon: MessageCircleQuestion,
    title: "Q&A回答動画",
    description: "会員からの質問を集め、動画で丁寧に回答。あなたの疑問を解決します",
  },
  {
    icon: Wallet,
    title: "家計簿ツール",
    description: "毎月の収支を記録して節約の成果を見える化。カテゴリ別に管理できます",
  },
  {
    icon: TrendingUp,
    title: "資産管理",
    description: "NISA、iDeCo、預金など全ての資産を一元管理。推移をグラフで確認",
  },
  {
    icon: Target,
    title: "ビジョンボード",
    description: "FIRE後の理想の生活を具体的にイメージ。目標金額と期日を設定",
  },
  {
    icon: Users,
    title: "コミュニティ交流",
    description: "同じ目標を持つ仲間と情報交換。モチベーションを維持できます",
  },
];

const benefits = [
  "初心者でもわかりやすい動画教材",
  "質問に動画で丁寧に回答",
  "家計簿・資産管理ツールが使い放題",
  "月2回のライブ配信で最新情報をキャッチ",
  "同じ目標を持つ仲間との交流",
  "FIRE達成までのロードマップが明確に",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Flame className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            経済的自立への道を
            <br />
            <span className="text-primary">一緒に歩もう</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            ファイヤーライフは、FIRE（経済的自立・早期リタイア）を目指す人のための
            オンラインコミュニティです。投資・節約・資産管理を体系的に学び、
            仲間と共に目標を達成しましょう。
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                今すぐ参加する
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8">
                詳しく見る
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            コミュニティの特徴
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <feature.icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 md:py-24 bg-muted/40">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            料金プラン
          </h2>
          <div className="max-w-md mx-auto">
            <Card className="border-primary shadow-lg">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-2">メンバーシップ</h3>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-4xl font-bold">¥5,000</span>
                  <span className="text-muted-foreground">/ 月</span>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register">
                  <Button size="lg" className="w-full text-lg">
                    今すぐ参加する
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-4">
                  いつでもキャンセル可能です
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
