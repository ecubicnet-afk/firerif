import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const templates = await prisma.budgetTemplate.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { category, amount, type, day, memo } = await request.json();

  if (!category || amount === undefined || !type) {
    return NextResponse.json(
      { error: "必須項目を入力してください" },
      { status: 400 }
    );
  }

  const template = await prisma.budgetTemplate.upsert({
    where: {
      userId_category_type: {
        userId: session.user.id,
        category,
        type,
      },
    },
    update: {
      amount: Math.round(amount),
      day: day || 1,
      memo: memo || null,
    },
    create: {
      userId: session.user.id,
      category,
      amount: Math.round(amount),
      type,
      day: day || 1,
      memo: memo || null,
    },
  });

  return NextResponse.json(template);
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

  await prisma.budgetTemplate.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
