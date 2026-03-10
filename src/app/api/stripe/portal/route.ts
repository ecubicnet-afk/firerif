import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "未認証" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "サブスクリプションが見つかりません" },
        { status: 404 }
      );
    }

    const portalSession = await createPortalSession(
      subscription.stripeCustomerId
    );

    return NextResponse.json({ url: portalSession.url });
  } catch {
    return NextResponse.json(
      { error: "ポータルセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
