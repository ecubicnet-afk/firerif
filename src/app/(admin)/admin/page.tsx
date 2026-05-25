import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, UserCheck, UserMinus, Video, Radio, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { MemberGrowthChart } from "@/components/admin/MemberGrowthChart";
import { SubscriptionPieChart } from "@/components/admin/SubscriptionPieChart";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "有効",
  TRIALING: "お試し",
  PAST_DUE: "支払い遅延",
  CANCELED: "解約済み",
  INACTIVE: "未登録",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#E0530E",
  TRIALING: "#F59E0B",
  PAST_DUE: "#d97706",
  CANCELED: "#e11d48",
  INACTIVE: "#94a3b8",
};

// 月額料金（MRR計算用）
const MONTHLY_PRICE = 5980;

export default async function AdminPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    userCount,
    newUsersThisMonth,
    subscriptionStats,
    atRiskCount,
    allUsers,
    courseCount,
    episodeCount,
    upcomingStreams,
    recentUsers,
    pastDueCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.subscription.groupBy({ by: ["status"], _count: true }),
    prisma.subscription.count({
      where: { cancelAtPeriodEnd: true, status: "ACTIVE" },
    }),
    prisma.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.videoCourse.count(),
    prisma.episode.count(),
    prisma.liveStream.findMany({
      where: { scheduledAt: { gte: now } },
      orderBy: { scheduledAt: "asc" },
      take: 1,
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.subscription.count({ where: { status: "PAST_DUE" } }),
  ]);

  // 課金ステータス内訳
  const subStatusMap: Record<string, number> = {
    ACTIVE: 0,
    TRIALING: 0,
    PAST_DUE: 0,
    CANCELED: 0,
    INACTIVE: 0,
  };
  for (const s of subscriptionStats) {
    subStatusMap[s.status] = s._count;
  }
  const usersWithSub = Object.values(subStatusMap).reduce((a, b) => a + b, 0);
  subStatusMap.INACTIVE += Math.max(0, userCount - usersWithSub);

  const activeCount = subStatusMap.ACTIVE + subStatusMap.TRIALING;

  const subscriptionChartData = Object.entries(subStatusMap).map(
    ([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || "#94a3b8",
    })
  );

  // 会員数の推移（累計）
  const monthMap = new Map<string, number>();
  for (const user of allUsers) {
    const d = new Date(user.createdAt);
    const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) || 0) + 1);
  }
  const sortedMonths = Array.from(monthMap.keys()).sort();
  let cumulative = 0;
  const growthData = sortedMonths.map((month) => {
    cumulative += monthMap.get(month) || 0;
    return { month, total: cumulative };
  });

  const nextStream = upcomingStreams[0];
  const nextStreamLabel = nextStream ? formatDate(nextStream.scheduledAt) : "未定";
  const mrr = activeCount * MONTHLY_PRICE;

  const kpiCards = [
    { label: "総会員数", value: userCount, icon: Users, href: "/admin/members", delta: newUsersThisMonth > 0 ? `+${newUsersThisMonth}` : null },
    { label: "課金中(有効+お試し)", value: activeCount, icon: UserCheck, href: "/admin/members", delta: null },
    { label: "解約予定", value: atRiskCount, icon: UserMinus, href: "/admin/members", delta: null, warn: atRiskCount > 0 },
    { label: "コンテンツ", value: `${courseCount}講座 ${episodeCount}話`, icon: Video, href: "/admin/courses", delta: null, smallText: true },
    { label: "次回ライブ", value: nextStreamLabel, icon: Radio, href: "/admin/live", delta: null, smallText: true },
  ];

  const alerts: { message: string; type: "warning" | "danger" }[] = [];
  if (pastDueCount > 0) alerts.push({ message: `支払い遅延: ${pastDueCount}名`, type: "danger" });
  if (atRiskCount > 0) alerts.push({ message: `解約予定の会員: ${atRiskCount}名`, type: "warning" });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-xl md:text-2xl font-bold">ダッシュボード</h1>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                alert.type === "danger"
                  ? "bg-red-50 text-red-800 border border-red-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {kpiCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card className={`h-full transition-all hover:shadow-md hover:-translate-y-0.5 ${card.warn ? "border-amber-300" : ""}`}>
              <CardContent className="p-4">
                <card.icon className={`h-5 w-5 mb-2 ${card.warn ? "text-amber-500" : "text-primary"}`} />
                <p className={`font-bold ${card.smallText ? "text-sm" : "text-2xl"}`}>{card.value}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  {card.delta && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">{card.delta}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* 会員数の推移 */}
      <Card>
        <CardContent className="pt-6">
          <MemberGrowthChart data={growthData} />
        </CardContent>
      </Card>

      {/* 課金内訳＋収益 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <SubscriptionPieChart data={subscriptionChartData} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-sm font-bold">収益概要</h3>
            <div>
              <p className="text-xs text-muted-foreground">推定MRR（月間定期収益）</p>
              <p className="text-3xl font-bold text-primary">¥{mrr.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-muted-foreground">有効会員</p>
                <p className="text-lg font-semibold">{subStatusMap.ACTIVE}名</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">お試し中</p>
                <p className="text-lg font-semibold">{subStatusMap.TRIALING}名</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">推定ARR（年間）</p>
                <p className="text-lg font-semibold">¥{(mrr * 12).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">月額料金</p>
                <p className="text-lg font-semibold">¥{MONTHLY_PRICE.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 最近の新規会員 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Users className="h-4 w-4" />
            最近の新規会員
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">まだ会員がいません</p>
          ) : (
            recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user.name || "名前未設定"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0 ml-2">{formatDate(user.createdAt)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
