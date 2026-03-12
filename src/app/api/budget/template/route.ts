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

  const { id, category, amount, type, day, memo, endDate } = await request.json();

  if (!category || amount === undefined || !type) {
    return NextResponse.json(
      { error: "必須項目を入力してください" },
      { status: 400 }
    );
  }

  const data = {
    amount: Math.round(amount),
    day: day || 1,
    memo: memo || null,
    endDate: endDate ? new Date(endDate) : null,
  };

  let template;
  if (id) {
    // Update existing template
    template = await prisma.budgetTemplate.update({
      where: { id },
      data,
    });
  } else {
    // Create new template
    template = await prisma.budgetTemplate.create({
      data: {
        userId: session.user.id,
        category,
        type,
        ...data,
      },
    });
  }

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
