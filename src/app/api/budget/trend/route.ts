import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 直近Nヶ月の「6マス家計簿」支出推移を返す（前月比・推移グラフ用）
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const months = Math.min(Math.max(parseInt(searchParams.get("months") || "6"), 1), 24);
  const endYear = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const endMonth = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));

  // 末尾(endYear/endMonth)から遡ってN期間を作る
  const periods: { year: number; month: number }[] = [];
  let y = endYear;
  let m = endMonth;
  for (let i = 0; i < months; i++) {
    periods.unshift({ year: y, month: m });
    m -= 1;
    if (m === 0) { m = 12; y -= 1; }
  }

  // 範囲内の6マス支出エントリ（costType/payMethodを持つEXPENSE）をまとめて取得
  const entries = await prisma.budgetEntry.findMany({
    where: {
      userId: session.user.id,
      type: "EXPENSE",
      costType: { not: null },
      payMethod: { not: null },
      OR: periods.map((p) => ({ year: p.year, month: p.month })),
    },
    select: { year: true, month: true, amount: true, costType: true, payMethod: true },
  });

  const result = periods.map((p) => {
    const es = entries.filter((e) => e.year === p.year && e.month === p.month);
    const sum = (pred: (e: (typeof es)[number]) => boolean) =>
      es.filter(pred).reduce((s, e) => s + e.amount, 0);
    const fixedTotal = sum((e) => e.costType === "FIXED");
    const variableTotal = sum((e) => e.costType === "VARIABLE");
    return {
      year: p.year,
      month: p.month,
      label: `${p.month}月`,
      fixedTotal,
      variableTotal,
      expenseTotal: fixedTotal + variableTotal,
      cardTotal: sum((e) => e.payMethod === "CARD"),
      bankTotal: sum((e) => e.payMethod === "BANK"),
      cashTotal: sum((e) => e.payMethod === "CASH"),
    };
  });

  return NextResponse.json(result);
}
