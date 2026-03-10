import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  TRIALING: "secondary",
  PAST_DUE: "destructive",
  CANCELED: "destructive",
  INACTIVE: "outline",
};

export const dynamic = 'force-dynamic';

export default async function AdminMembersPage() {
  const users = await prisma.user.findMany({
    include: { subscription: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">会員一覧</h1>

      <div className="space-y-2">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{user.name || "名前未設定"}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">
                  登録日: {formatDate(user.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {user.role === "ADMIN" && <Badge>管理者</Badge>}
                <Badge
                  variant={
                    statusColors[user.subscription?.status ?? "INACTIVE"]
                  }
                >
                  {user.subscription?.status ?? "INACTIVE"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
