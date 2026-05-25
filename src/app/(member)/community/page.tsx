import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ExternalLink, Sparkles } from "lucide-react";

const COMMUNITY_BETA_FREE = process.env.COMMUNITY_BETA_FREE === "true";
const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_URL || "#";

// ローンチ時の部活3つ（2026-05-25確定・まず3つで開始→徐々に増やす）
const clubs = [
  { emoji: "🏦", name: "節約部", desc: "固定費見直し・家計簿シェア" },
  { emoji: "💼", name: "副業部", desc: "入金力アップ・副収入づくり" },
  { emoji: "📈", name: "個別株部", desc: "注目銘柄・ポートフォリオ相談" },
];

export default function CommunityPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">コミュニティ</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          仲間と続ける場所。質問・雑談・報告はぜんぶ Discord で。
        </p>
      </div>

      {COMMUNITY_BETA_FREE && (
        <Card className="bg-amber-50 border-amber-300 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="flex items-center gap-3 p-4">
            <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <span className="font-bold">ベータ期間中</span> — 今はすべて無料開放中。正式リリース後は有料会員限定です。
            </p>
          </CardContent>
        </Card>
      )}

      {/* Discord 参加 */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-primary/15">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-bold text-lg">Discordに参加しよう</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              一人だと続かない節約・投資も、仲間がいれば続きます。
              まずは自己紹介から。困ったとき・雑談・質問もぜんぶここでOK。
            </p>
          </div>
          <a href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full sm:w-auto">
              Discordを開く
              <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* 部活4つ */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
          部活（入部自由・掛け持ちOK）
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {clubs.map((c) => (
            <Card key={c.name}>
              <CardContent className="p-4">
                <div className="text-2xl mb-1">{c.emoji}</div>
                <p className="font-bold text-sm">{c.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 px-1 leading-relaxed">
          自分の「居場所」を決めると続けやすくなります。気になる部に入って、報告し合いましょう。
        </p>
      </div>

      {/* ルール */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">コミュニティのお願い</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>1. お互い敬意を持って接しましょう</p>
          <p>2. 個人情報の取り扱いには注意してください</p>
          <p>3. 投資判断は各自の責任で（ここは助言の場ではありません）</p>
          <p>4. スパム・宣伝はご遠慮ください</p>
          <p>5. 困ったら運営（つよび・よわび）まで気軽に</p>
        </CardContent>
      </Card>
    </div>
  );
}
