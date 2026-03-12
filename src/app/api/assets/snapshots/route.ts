import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const snapshots = await prisma.assetSnapshot.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(snapshots);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { date, totalAsset, totalProfit, nisaValue, cashValue, purchaseAmount } =
    await request.json();

  if (!date || totalAsset === undefined) {
    return NextResponse.json({ error: "必須項目が不足" }, { status: 400 });
  }

  const snapshot = await prisma.assetSnapshot.upsert({
    where: {
      userId_date: { userId: session.user.id, date },
    },
    update: {
      totalAsset: Math.round(totalAsset),
      totalProfit: Math.round(totalProfit || 0),
      nisaValue: Math.round(nisaValue || 0),
      cashValue: Math.round(cashValue || 0),
      purchaseAmount: Math.round(purchaseAmount || 0),
    },
    create: {
      userId: session.user.id,
      date,
      totalAsset: Math.round(totalAsset),
      totalProfit: Math.round(totalProfit || 0),
      nisaValue: Math.round(nisaValue || 0),
      cashValue: Math.round(cashValue || 0),
      purchaseAmount: Math.round(purchaseAmount || 0),
    },
  });

  return NextResponse.json(snapshot);
}
