import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const holdings = await prisma.portfolioHolding.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Group by source
  const grouped: Record<string, typeof holdings> = {};
  for (const h of holdings) {
    if (!grouped[h.source]) grouped[h.source] = [];
    grouped[h.source].push(h);
  }

  const datasets = Object.entries(grouped).map(([source, items]) => ({
    fileName: source,
    items: items.map((i) => ({
      id: i.id,
      source: i.source,
      name: i.name,
      marketValue: i.marketValue,
      profit: i.profit,
      nisaType: i.nisaType,
      assetType: i.assetType,
      region: i.region,
    })),
    total: items.reduce((s, i) => s + i.marketValue, 0),
    cash: 0,
  }));

  return NextResponse.json(datasets);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { source, items, cash } = await request.json();

  if (!source || !Array.isArray(items)) {
    return NextResponse.json({ error: "不正なデータ" }, { status: 400 });
  }

  // Delete existing holdings from same source
  await prisma.portfolioHolding.deleteMany({
    where: { userId: session.user.id, source },
  });

  // Create new holdings
  if (items.length > 0) {
    await prisma.portfolioHolding.createMany({
      data: items.map((i: { name: string; marketValue: number; profit: number; nisaType: string; assetType: string; region: string }) => ({
        userId: session.user.id!,
        source,
        name: i.name,
        marketValue: Math.round(i.marketValue),
        profit: Math.round(i.profit),
        nisaType: i.nisaType || "特定/一般",
        assetType: i.assetType || "その他",
        region: i.region || "その他の地域",
      })),
    });
  }

  return NextResponse.json({ ok: true, count: items.length });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { source } = await request.json();

  if (!source) {
    return NextResponse.json({ error: "source必須" }, { status: 400 });
  }

  await prisma.portfolioHolding.deleteMany({
    where: { userId: session.user.id, source },
  });

  return NextResponse.json({ ok: true });
}
