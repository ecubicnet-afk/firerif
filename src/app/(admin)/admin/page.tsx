import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserMinus,
  Video,
  Radio,
  MessageCircleQuestion,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { MemberGrowthChart } from "@/components/admin/MemberGrowthChart";
import { SubscriptionPieChart } from "@/components/admin/SubscriptionPieChart";
import { EngagementChart } from "@/components/admin/EngagementChart";
import { QuestionStatusChart } from "@/components/admin/QuestionStatusChart";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "有効",
  TRIALING: "お試し",
  PAST_DUE: "支払い遅延",
  CANCELED: "解約済み",
  INACTIVE: "未登録",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#059669",
  TRIALING: "#2563eb",
  PAST_DUE: "#d97706",
  CANCELED: "#e11d48",
  INACTIVE: "#94a3b8",
};

const QUESTION_STATUS_LABELS: Record<string, string> = {
  PENDING: "未回答",
  SYNCED: "同期済み",
  ANSWERED: "回答済み",
};

const QUESTION_STATUS_COLORS: Record<string, string> = {
  PENDING: "#d97706",
  SYNCED: "#2563eb",
  ANSWERED: "#059669",
};

// Monthly price in JPY for MRR calculation
const MONTHLY_PRICE = 1980;

export default async function AdminPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const [
    userCount,
    newUsersThisMonth,
    subscriptionStats,
    atRiskCount,
    allUsers,
    courseCount,
    episodeCount,
    streamCount,
    upcomingStreams,
    questionStats,
    budgetUsers,
    assetUsers,
    portfolioUsers,
    visionUsers,
    todoUsers,
    lifePlanUsers,
    recentUsers,
    recentQuestions,
    pastDueCount,
    oldPendingQuestions,
  ] = await Promise.all([
    // KPI counts
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.subscription.groupBy({ by: ["status"], _count: true }),
    prisma.subscription.count({
      where: { cancelAtPeriodEnd: true, status: "ACTIVE" },
    }),
    // Growth chart data
    prisma.user.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    // Content stats
    prisma.videoCourse.count(),
    prisma.episode.count(),
    prisma.liveStream.count(),
    prisma.liveStream.findMany({
      where: { scheduledAt: { gte: now } },
      orderBy: { scheduledAt: "asc" },
      take: 1,
    }),
    // Question stats
    prisma.question.groupBy({ by: ["status"], _count: true }),
    // Engagement: distinct user counts per feature
    prisma.budgetEntry
      .findMany({ select: { userId: true }, distinct: ["userId"] })
      .then((r) => r.length),
    prisma.asset
      .findMany({ select: { userId: true }, distinct: ["userId"] })
      .then((r) => r.length),
    prisma.portfolioHolding
      .findMany({ select: { userId: true }, distinct: ["userId"] })
      .then((r) => r.length),
    prisma.visionItem
      .findMany({ select: { userId: true }, distinct: ["userId"] })
      .then((r) => r.length),
    prisma.todo
      .findMany({ select: { userId: true }, distinct: ["userId"] })
      .then((r) => r.length),
    prisma.lifePlan
      .findMany({ select: { userId: true }, distinct: ["userId"] })
      .then((r) => r.length),
    // Recent activity
    prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.question.findMany({
      select: {
        id: true,
        content: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Alerts
    prisma.subscription.count({ where: { status: "PAST_DUE" } }),
    prisma.question.count({
      where: { status: "PENDING", createdAt: { lte: threeDaysAgo } },
    }),
  ]);

  // Compute subscription breakdown
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
  // Users without subscription count as INACTIVE
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

  // Compute monthly growth data
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

  // Question stats
  const questionStatusMap: Record<string, number> = {
    PENDING: 0,
    SYNCED: 0,
    ANSWERED: 0,
  };
  for (const q of questionStats) {
    questionStatusMap[q.status] = q._count;
  }
  const pendingCount = questionStatusMap.PENDING;

  const questionChartData = Object.entries(questionStatusMap).map(
    ([status, count]) => ({
      name: QUESTION_STATUS_LABELS[status] || status,
      value: count,
      color: QUESTION_STATUS_COLORS[status] || "#94a3b8",
    })
  );

  // Engagement data
  const engagementData = [
    { feature: "家計簿", users: budgetUsers },
    { feature: "資産管理", users: assetUsers },
    { feature: "ポートフォリオ", users: portfolioUsers },
    { feature: "ビジョンボード", users: visionUsers },
    { feature: "Todo", users: todoUsers },
    { feature: "ライフプラン", users: lifePlanUsers },
  ];

  // Next stream info
  const nextStream = upcomingStreams[0];
  const nextStreamLabel = nextStream
    ? formatDate(nextStream.scheduledAt)
    : "未定";

  // MRR
  const mrr = activeCount * MONTHLY_PRICE;

  // KPI cards
  const kpiCards = [
    {
      label: "総会員数",
      value: userCount,
      icon: Users,
      href: "/admin/members",
      delta: newUsersThisMonth > 0 ? `+${newUsersThisMonth}` : null,
    },
    {
      label: "アクティブ会員",
      value: activeCount,
      icon: UserCheck,
      href: "/admin/members",
      delta: null,
    },
    {
      label: "解約予定",
      value: atRiskCount,
      icon: UserMinus,
      href: "/admin/members",
      delta: null,
      warn: atRiskCount > 0,
    },
    {
      label: "コンテンツ数",
      value: `${courseCount}講座 ${episodeCount}話`,
      icon: Video,
      href: "/admin/courses",
      delta: null,
    },
    {
      label: "未回答の質問",
      value: pendingCount,
      icon: MessageCircleQuestion,
      href: "/admin/questions",
      delta: null,
      warn: pendingCount > 0,
    },
    {
      label: "次回ライブ",
      value: nextStreamLabel,
      icon: Radio,
      href: "/admin/live",
      delta: null,
      smallText: true,
    },
  ];

  // Alerts
  const alerts: { message: string; type: "warning" | "danger" }[] = [];
  if (pastDueCount > 0) {
    alerts.push({
      message: `支払い遅延: ${pastDueCount}名`,
      type: "danger",
    });
  }
  if (oldPendingQuestions > 0) {
    alerts.push({
      message: `3日以上未回答の質問: ${oldPendingQuestions}件`,
      type: "warning",
    });
  }
  if (atRiskCount > 0) {
    alerts.push({
      message: `解約予定の会員: ${atRiskCount}名`,
      type: "warning",
    });
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">管理画面</h1>

      {/* Alerts */}
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

      {/* Section 1: KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                card.warn ? "border-amber-300" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <card.icon
                  className={`h-5 w-5 ${
                    card.warn ? "text-amber-500" : "text-muted-foreground"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <p
                  className={`font-bold ${
                    card.smallText ? "text-sm" : "text-2xl"
                  }`}
                >
                  {card.value}
                </p>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  {card.delta && (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                      {card.delta}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Section 2: Member Growth Chart */}
      <Card>
        <CardContent className="pt-6">
          <MemberGrowthChart data={growthData} />
        </CardContent>
      </Card>

      {/* Section 3: Subscription & Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <SubscriptionPieChart data={subscriptionChartData} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="text-sm font-bold">収益概要</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">推定MRR（月間定期収益）</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ¥{mrr.toLocaleString()}
                </p>
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
                  <p className="text-lg font-semibold">
                    ¥{(mrr * 12).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">月額料金</p>
                  <p className="text-lg font-semibold">
                    ¥{MONTHLY_PRICE.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section 4: Feature Engagement + Q&A */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <EngagementChart data={engagementData} totalUsers={userCount} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <QuestionStatusChart data={questionChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Section 5: Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4" />
              最近の新規会員
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.name || "名前未設定"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground shrink-0 ml-2">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MessageCircleQuestion className="h-4 w-4" />
              最近の質問
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">質問なし</p>
            ) : (
              recentQuestions.map((q) => (
                <div key={q.id} className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{q.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {q.user.name || "匿名"} ・{" "}
                      {formatDate(q.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      q.status === "ANSWERED"
                        ? "default"
                        : q.status === "PENDING"
                        ? "destructive"
                        : "secondary"
                    }
                    className="shrink-0 text-[10px]"
                  >
                    {QUESTION_STATUS_LABELS[q.status] || q.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
