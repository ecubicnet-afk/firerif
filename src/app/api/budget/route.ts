import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

  const entries = await prisma.budgetEntry.findMany({
    where: {
      userId: session.user.id,
      year,
      month,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { year, month, category, amount, type, memo } = await request.json();

  if (!category || amount === undefined || !type) {
    return NextResponse.json(
      { error: "必須項目を入力してください" },
      { status: 400 }
    );
  }

  const entry = await prisma.budgetEntry.create({
    data: {
      userId: session.user.id,
      year: year || new Date().getFullYear(),
      month: month || new Date().getMonth() + 1,
      category,
      amount: Math.round(amount),
      type,
      memo: memo || null,
    },
  });

  return NextResponse.json(entry);
}
