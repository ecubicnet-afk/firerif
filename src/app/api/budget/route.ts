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

  const { year, month, day, category, amount, type, costType, payMethod, memo, imageData } = await request.json();

  const VALID_TYPES = ["EXPENSE", "INCOME", "SAVING", "FIXED_COST"];
  const VALID_COST_TYPES = ["FIXED", "VARIABLE"];
  const VALID_PAY_METHODS = ["CARD", "BANK", "CASH"];
  if (!category || amount === undefined || !type) {
    return NextResponse.json(
      { error: "必須項目を入力してください" },
      { status: 400 }
    );
  }
  if (typeof amount !== "number" || !isFinite(amount) || amount < 0 || amount > 100_000_000) {
    return NextResponse.json(
      { error: "金額は0以上1億以下の数値を入力してください" },
      { status: 400 }
    );
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: "無効なタイプです" },
      { status: 400 }
    );
  }
  if (costType !== undefined && costType !== null && !VALID_COST_TYPES.includes(costType)) {
    return NextResponse.json({ error: "無効な費目区分です" }, { status: 400 });
  }
  if (payMethod !== undefined && payMethod !== null && !VALID_PAY_METHODS.includes(payMethod)) {
    return NextResponse.json({ error: "無効な支払い方法です" }, { status: 400 });
  }

  const entry = await prisma.budgetEntry.create({
    data: {
      userId: session.user.id,
      year: year || new Date().getFullYear(),
      month: month || new Date().getMonth() + 1,
      day: day || new Date().getDate(),
      category,
      amount: Math.round(amount),
      type,
      costType: costType || null,
      payMethod: payMethod || null,
      memo: memo || null,
      imageData: imageData || null,
    },
  });

  return NextResponse.json(entry);
}
