"use client";

import Link from "next/link";
import {
  Flame,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Users,
  Video,
  Wallet,
  Radio,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 活用ガイド＝入会後の順路（2026-05-24確定）：なぜ → 仲間 → 守り → 攻め
const steps = [
  {
    no: 1,
    title: "目的を決める",
    lead: "なぜFIREを目指す？ 何を叶えたい？",
    body: "すべての起点は「目的」。節約ドリームで、なりたい姿と必要な金額をイメージしましょう。これが決まると、毎月いくら節約・投資すればいいかも見えてきます。",
    links: [{ href: "/dream", label: "節約ドリームを開く", icon: Sparkles }],
  },
  {
    no: 2,
    title: "仲間に挨拶する",
    lead: "Discordで自己紹介",
    body: "一人だと続きません。Discordで「はじめまして」を投稿しましょう。宣言すると人は続けやすくなります（コミットメント効果）。困ったとき・雑談・質問もぜんぶDiscordで。",
    links: [{ href: "/community", label: "Discordに参加", icon: Users }],
  },
  {
    no: 3,
    title: "守りを固める（最初の3ヶ月）",
    lead: "節約で土台をつくる ★最優先",
    body: "①1ヶ月以内に「最強の節約コーチング（全10回）」を見る → ②ズボラ6マス家計簿で支出を見える化 → 削れるものは一気にガッツリ削る。月初の「守りのマネー診断会」でみんなと一緒に家計を診て、削減ネタを共有します。",
    links: [
      { href: "/courses", label: "最強の節約コーチング", icon: Video },
      { href: "/budget", label: "ズボラ6マス家計簿", icon: Wallet },
      { href: "/live", label: "守りのマネー診断会", icon: Radio },
    ],
  },
  {
    no: 4,
    title: "攻めも並行する",
    lead: "投資で増やす（並行OK）",
    body: "守りを固めながら、攻めも始めてOK。資産管理で自分のポートフォリオを見える化し、月中の「攻めのマネー戦略会」で新NISA・iDeCoなど制度の使い方やポートの考え方を学びましょう。優先は守り、攻めは並行で。",
    links: [
      { href: "/assets", label: "資産管理（ポート）", icon: TrendingUp },
      { href: "/live", label: "攻めのマネー戦略会", icon: Radio },
    ],
  },
];

const todo = [
  "1ヶ月以内に「最強の節約コーチング」全10回を見る",
  "家計を見える化して、削れるものは一気に削る",
  "ズボラ6マス家計簿を、まず3ヶ月つづける",
];

export default function GuidePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          ダッシュボードに戻る
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Flame className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">活用ガイド</h1>
            <p className="text-sm text-muted-foreground">入会したら、この4ステップで進めよう</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          ファイアライフBASEは「節約で守りを固め、投資で増やす」を仲間と続ける場所です。
          いろんな機能がありますが、迷ったら下の<strong className="text-foreground">なぜ → 仲間 → 守り → 攻め</strong>の順でOK。
        </p>
      </div>

      {/* 4 steps */}
      <div className="space-y-4">
        {steps.map((s) => (
          <Card key={s.no} className="overflow-hidden">
            <CardContent className="p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {s.no}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-primary">STEP {s.no}</p>
                  <h2 className="text-lg font-bold leading-tight">{s.title}</h2>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5">{s.lead}</p>
                  <p className="text-sm leading-relaxed mt-3">{s.body}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {s.links.map((l) => (
                      <Button key={l.href} asChild variant="outline" size="sm" className="h-9">
                        <Link href={l.href}>
                          <l.icon className="mr-1 h-4 w-4" />
                          {l.label}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* やることまとめ */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-5 md:p-6">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            まず、これだけやればOK
          </h2>
          <ul className="space-y-2">
            {todo.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm leading-relaxed">
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Footer CTA */}
      <div className="text-center space-y-3 pt-4">
        <p className="text-sm text-muted-foreground">準備ができたら、ダッシュボードから各ツールへ。</p>
        <Button asChild size="lg">
          <Link href="/dashboard">
            ダッシュボードへ
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
