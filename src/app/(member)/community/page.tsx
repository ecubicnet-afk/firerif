import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, ExternalLink, Sparkles } from "lucide-react";

const COMMUNITY_BETA_FREE = process.env.COMMUNITY_BETA_FREE === "true";

const communityLinks = [
  {
    title: "Discord コミュニティ",
    description:
      "メンバー同士でリアルタイムに交流できるDiscordサーバーです。投資や節約の情報共有、雑談、質問なんでもOK。",
    icon: MessageCircle,
    url: "#",
    color: "bg-indigo-500",
  },
  {
    title: "LINE オープンチャット",
    description:
      "気軽にチャットできるLINEオープンチャットです。日常の節約報告や資産報告などを共有しましょう。",
    icon: MessageCircle,
    url: "#",
    color: "bg-green-500",
  },
];

export default function CommunityPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">コミュニティ</h1>
        <p className="text-muted-foreground mt-1">
          ファイアライフのメンバー同士で交流しましょう
        </p>
      </div>

      {COMMUNITY_BETA_FREE && (
        <Card className="bg-yellow-50 border-yellow-300 dark:bg-yellow-950 dark:border-yellow-800">
          <CardContent className="flex items-center gap-3 p-4">
            <Sparkles className="h-5 w-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <span className="font-bold">ベータテスト期間中</span> —
              現在すべての機能を無料で開放しています。正式リリース後は有料会員限定となります。
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center gap-4 p-6">
          <Users className="h-10 w-10 text-primary" />
          <div>
            <p className="font-bold">コミュニティに参加しよう</p>
            <p className="text-sm text-muted-foreground">
              同じ目標を持つ仲間と繋がることで、FIREへのモチベーションが続きます。
              下のリンクからコミュニティに参加してください。
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {communityLinks.map((link) => (
          <Card key={link.title}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${link.color}`}>
                  <link.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <Button>
                  参加する
                  <ExternalLink className="h-4 w-4 ml-1" />
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">コミュニティルール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. メンバー同士、敬意を持って接しましょう</p>
          <p>2. 個人情報の取り扱いには十分注意してください</p>
          <p>3. 投資の助言は各自の責任で行ってください</p>
          <p>4. スパムや宣伝行為は禁止です</p>
          <p>5. 困ったことがあれば管理者にご連絡ください</p>
        </CardContent>
      </Card>
    </div>
  );
}
