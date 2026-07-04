import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 会員のアクセス権を運営が手動で切り替える（案B・2026-06-28）
// 有料 = ACTIVE（全機能解放） / 無料 = INACTIVE（締め出し・データは保持）
// MOSH決済とアプリは自動連携しないため、運営がMOSHの決済リストとメールで照合して切り替える
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await request.json();
  const userId: unknown = body?.userId;
  const status: unknown = body?.status;

  if (
    typeof userId !== "string" ||
    (status !== "ACTIVE" && status !== "INACTIVE")
  ) {
    return NextResponse.json(
      { error: "userId と status（ACTIVE / INACTIVE）が必要です" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "会員が見つかりません" }, { status: 404 });
  }

  // サブスクが無ければ作成（手動運用なので stripeCustomerId はユーザーごとのプレースホルダ）
  const subscription = await prisma.subscription.upsert({
    where: { userId },
    update: { status },
    create: {
      userId,
      status,
      stripeCustomerId: `manual_${userId}`,
    },
  });

  return NextResponse.json({ ok: true, status: subscription.status });
}
