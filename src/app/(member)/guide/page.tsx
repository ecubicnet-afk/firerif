"use client";

import Link from "next/link";
import { Flame, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuideTableOfContents } from "@/components/tools/GuideTableOfContents";
import { ToolSection } from "@/components/tools/ToolSection";
import { ToolDescription } from "@/components/tools/ToolDescription";
import { guideCategories } from "@/lib/guide-data";

export default function GuidePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
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
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Flame className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ファイヤーライフ 活用ガイド</h1>
            <p className="text-sm text-muted-foreground">
              知識の習得から実践、習慣化までをトータルサポート
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
          ファイヤーライフは、FIRE（経済的自立と早期リタイア）を目指すあなたのために設計されたオールインワンプラットフォームです。
          以下の5つのステップで、学び → 把握 → 行動 → 成長 → 仲間 のサイクルを回し、着実にFIREへ近づきましょう。
        </p>
      </div>

      {/* Table of Contents */}
      <GuideTableOfContents categories={guideCategories} />

      {/* Sections */}
      {guideCategories.map((category) => (
        <ToolSection
          key={category.id}
          id={category.id}
          number={category.number}
          title={category.title}
          subtitle={category.subtitle}
          description={category.description}
        >
          {category.tools.map((tool, toolIndex) => (
            <ToolDescription key={tool.id} tool={tool} index={toolIndex} />
          ))}
        </ToolSection>
      ))}

      {/* Footer CTA */}
      <div className="text-center space-y-4 pt-8 border-t">
        <h2 className="text-xl font-bold">
          まずはここから始めよう
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          すべてのツールはダッシュボードからアクセスできます。
          まずは気になるツールをひとつ選んで、今日から使い始めてみましょう。
        </p>
        <Button asChild size="lg">
          <Link href="/dashboard">ダッシュボードへ</Link>
        </Button>
      </div>
    </div>
  );
}
