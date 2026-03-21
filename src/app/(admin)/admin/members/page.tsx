import { prisma } from "@/lib/prisma";
import { MemberList } from "@/components/admin/MemberList";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const users = await prisma.user.findMany({
    include: {
      subscription: true,
      _count: {
        select: {
          budgetEntries: true,
          assets: true,
          portfolioHoldings: true,
          visionItems: true,
          todos: true,
          lifePlans: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for client component
  const members = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    subscription: user.subscription
      ? {
          status: user.subscription.status,
          cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
          currentPeriodEnd:
            user.subscription.currentPeriodEnd?.toISOString() ?? null,
        }
      : null,
    _count: user._count,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">会員一覧</h1>
      <MemberList members={members} />
    </div>
  );
}
