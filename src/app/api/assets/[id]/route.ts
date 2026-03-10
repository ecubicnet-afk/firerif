import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { id } = await params;
  const { name, category, amount, date, memo } = await request.json();

  const existing = await prisma.asset.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "データが見つかりません" }, { status: 404 });
  }

  const updated = await prisma.asset.update({
    where: { id },
    data: {
      name,
      category,
      amount: Math.round(amount),
      date: date ? new Date(date) : undefined,
      memo,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.asset.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "データが見つかりません" }, { status: 404 });
  }

  await prisma.asset.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
