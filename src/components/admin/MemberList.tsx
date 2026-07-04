"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  AlertTriangle,
  Calculator,
  PieChart,
  Briefcase,
  Eye,
  CheckSquare,
  Map,
} from "lucide-react";

interface AdminMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  subscription: {
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
  } | null;
  _count: {
    budgetEntries: number;
    assets: number;
    portfolioHoldings: number;
    visionItems: number;
    todos: number;
    lifePlans: number;
  };
}

interface Props {
  members: AdminMember[];
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "有効",
  TRIALING: "お試し",
  PAST_DUE: "支払い遅延",
  CANCELED: "解約済み",
  INACTIVE: "未登録",
};

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  ACTIVE: "default",
  TRIALING: "secondary",
  PAST_DUE: "destructive",
  CANCELED: "destructive",
  INACTIVE: "outline",
};

const FEATURES = [
  { key: "budgetEntries" as const, label: "家計簿", icon: Calculator },
  { key: "assets" as const, label: "資産", icon: PieChart },
  { key: "portfolioHoldings" as const, label: "ポートフォリオ", icon: Briefcase },
  { key: "visionItems" as const, label: "ビジョン", icon: Eye },
  { key: "todos" as const, label: "Todo", icon: CheckSquare },
  { key: "lifePlans" as const, label: "ライフプラン", icon: Map },
];

type SortOption = "createdAt" | "name" | "status";

export function MemberList({ members }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState<SortOption>("createdAt");
  const [pendingId, setPendingId] = useState<string | null>(null);

  // 有料(ACTIVE) ↔ 無料(INACTIVE) を運営が切り替える
  async function toggleAccess(member: AdminMember) {
    const isActive = (member.subscription?.status ?? "INACTIVE") === "ACTIVE";
    const newStatus = isActive ? "INACTIVE" : "ACTIVE";

    // 無料化（締め出し）は誤操作防止に確認
    if (
      newStatus === "INACTIVE" &&
      !window.confirm(
        `${member.name || member.email} さんを「無料」（アクセス無効）にしますか？\n※データは残るので、再度「有料」にすればすぐ戻せます。`
      )
    ) {
      return;
    }

    setPendingId(member.id);
    try {
      const res = await fetch("/api/admin/members", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: member.id, status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        window.alert(data.error || "更新に失敗しました");
      } else {
        router.refresh();
      }
    } catch {
      window.alert("更新に失敗しました");
    } finally {
      setPendingId(null);
    }
  }

  const filtered = useMemo(() => {
    let result = members;

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          (m.name?.toLowerCase().includes(q) ?? false) ||
          m.email.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (m) => (m.subscription?.status ?? "INACTIVE") === statusFilter
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "status": {
          const sa = a.subscription?.status ?? "INACTIVE";
          const sb = b.subscription?.status ?? "INACTIVE";
          return sa.localeCompare(sb);
        }
        case "createdAt":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [members, search, statusFilter, sort]);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="名前・メールで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="all">全てのステータス</option>
          <option value="ACTIVE">有効</option>
          <option value="TRIALING">お試し</option>
          <option value="PAST_DUE">支払い遅延</option>
          <option value="CANCELED">解約済み</option>
          <option value="INACTIVE">未登録</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="createdAt">登録日順</option>
          <option value="name">名前順</option>
          <option value="status">ステータス順</option>
        </select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length}名 / {members.length}名
      </p>

      {/* Member list */}
      <div className="space-y-2">
        {filtered.map((member) => {
          const status = member.subscription?.status ?? "INACTIVE";
          const usedFeatures = FEATURES.filter(
            (f) => member._count[f.key] > 0
          );

          return (
            <Card key={member.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {member.name || "名前未設定"}
                    </p>
                    {member.subscription?.cancelAtPeriodEnd && (
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {member.email}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs text-muted-foreground">
                      登録日: {formatDate(member.createdAt)}
                    </p>
                    {member.subscription?.currentPeriodEnd && (
                      <p className="text-xs text-muted-foreground">
                        期間終了: {formatDate(member.subscription.currentPeriodEnd)}
                      </p>
                    )}
                  </div>
                  {/* Feature usage indicators */}
                  {usedFeatures.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {usedFeatures.map((f) => (
                        <span
                          key={f.key}
                          title={`${f.label}: ${member._count[f.key]}件`}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px]"
                        >
                          <f.icon className="h-3 w-3" />
                          {f.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    {member.role === "ADMIN" && <Badge>管理者</Badge>}
                    <Badge variant={statusColors[status]}>
                      {status === "ACTIVE" ? "有料" : STATUS_LABELS[status] || status}
                    </Badge>
                  </div>
                  {member.role !== "ADMIN" && (
                    <Button
                      size="sm"
                      variant={status === "ACTIVE" ? "outline" : "default"}
                      disabled={pendingId === member.id}
                      onClick={() => toggleAccess(member)}
                    >
                      {pendingId === member.id
                        ? "更新中..."
                        : status === "ACTIVE"
                        ? "無料にする"
                        : "有料にする"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            該当する会員がいません
          </p>
        )}
      </div>
    </div>
  );
}
