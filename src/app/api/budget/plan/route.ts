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

  const plans = await prisma.budgetPlan.findMany({
    where: {
      userId: session.user.id,
      year,
      month,
    },
  });

  return NextResponse.json(plans);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { year, month, category, amount, type } = await request.json();

  if (!category || amount === undefined || !type) {
    return NextResponse.json(
      { error: "必須項目を入力してください" },
      { status: 400 }
    );
  }

  const plan = await prisma.budgetPlan.upsert({
    where: {
      userId_year_month_category_type: {
        userId: session.user.id,
        year,
        month,
        category,
        type,
      },
    },
    update: { amount: Math.round(amount) },
    create: {
      userId: session.user.id,
      year,
      month,
      category,
      amount: Math.round(amount),
      type,
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

  await prisma.budgetPlan.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
