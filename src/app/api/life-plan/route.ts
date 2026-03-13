import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const plans = await prisma.lifePlan.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(plans);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { name, data } = await request.json();

  const plan = await prisma.lifePlan.create({
    data: {
      userId: session.user.id,
      name: name || "マイプラン",
      data: data ?? {},
    },
  });

  return NextResponse.json(plan);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { id, name, data } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
  }

  const existing = await prisma.lifePlan.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "プランが見つかりません" }, { status: 404 });
  }

  const plan = await prisma.lifePlan.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(data !== undefined && { data }),
    },
  });

  return NextResponse.json(plan);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
  }

  const existing = await prisma.lifePlan.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "プランが見つかりません" }, { status: 404 });
  }

  await prisma.lifePlan.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
