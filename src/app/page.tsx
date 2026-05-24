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
  Sparkles,
  Users,
  CheckCircle,
} from "lucide-react";

// コミュニティの中身（2026-05-24 確定サービス設計に準拠）
const features = [
  {
    icon: Video,
    title: "最強の節約コーチング（全10回）",
    description: "「ゼロから投資資金を生み出す」動画講座。我慢ではなく「仕組み」で削る。初月で会費のモトを取る設計。",
  },
  {
    icon: Radio,
    title: "月2回のライブ",
    description: "月初「守りのマネー診断会」(家計簿をみんなでつける)＋月中「攻めのマネー戦略会」(投資相談・ポート)。Zoomで参加。",
  },
  {
    icon: Wallet,
    title: "6枠家計簿（月末1回）",
    description: "毎日つけるのをやめる。月末に1回、固定費/変動費 × クレカ/口座/現金 の6枠に振り分けるだけ。",
  },
  {
    icon: Sparkles,
    title: "節約ドリーム",
    description: "夢を描く→日々のちりつもを「拾う」→投資シミュで夢に近づく。目標と行動を1画面で。続けるためのモチベ装置。",
  },
  {
    icon: TrendingUp,
    title: "資産管理（ファイアライフ流ポート）",
    description: "FANG+/日経225/S&P500/オルカン/個別株を各20%。攻めの受け皿を「資産管理」で見える化。",
  },
  {
    icon: Users,
    title: "Discordコミュニティ",
    description: "節約・新NISA・高配当・サイドFIRE準備の部活4つ。仲間と続ける。質問・雑談もここでいつでも。",
  },
];

// 入会後のロードマップ（活用ガイド4STEP）
const roadmap = [
  { step: "STEP 1", title: "目的を決める", desc: "「節約ドリーム」で、なぜFIREを目指すか・何を叶えたいかを言語化。" },
  { step: "STEP 2", title: "仲間に挨拶", desc: "Discordで自己紹介。宣言すると続けやすくなる（コミットメント効果）。" },
  { step: "STEP 3", title: "守りを固める", desc: "節約コーチング＋6枠家計簿で支出を見える化。守りのマネー診断会で後押し。" },
  { step: "STEP 4", title: "攻めも並行", desc: "ファイアライフ流ポートで増やす。攻めのマネー戦略会で相談しながら。" },
];

const benefits = [
  "最強の節約コーチング 全10回（初心者でも迷わない）",
  "月2回のライブ（守り＝家計診断／攻め＝投資相談）",
  "6枠家計簿＋資産管理ツールが使い放題",
  "Discordで仲間と続ける（質問もここ）",
  "活用ガイド4STEPで「何から始めるか」が明確",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/12 via-brand/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Flame className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            お金と時間に余裕を
            <br />
            <span className="text-primary">仲間と"with FIRE"</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            完全リタイアじゃなく、資産収入で「お金と時間」に余裕を作る生き方＝with FIRE。
            節約で守りを固め、新NISAで増やす。それを仲間と一緒に続けるコミュニティです。
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
            コミュニティの中身
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="transition-all hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-secondary/40 to-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            with FIRE までの道のり
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            入会後はこの4ステップで進みます。「何から始めればいい？」で迷いません。
          </p>
          <div className="grid gap-4 md:grid-cols-4 max-w-5xl mx-auto">
            {roadmap.map((r) => (
              <Card key={r.step} className="h-full">
                <CardContent className="p-5">
                  <span className="inline-block text-xs font-bold text-primary mb-2">{r.step}</span>
                  <h3 className="font-bold mb-1">{r.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
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
                  <span className="text-4xl font-bold">¥5,980</span>
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
