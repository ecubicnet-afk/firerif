import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const body = await request.json();
  const { date, content, amount, note } = body;

  if (!date || !content?.trim()) {
    return NextResponse.json(
      { error: "日付と内容は必須です" },
      { status: 400 }
    );
  }

  const entry = await prisma.journalEntry.upsert({
    where: {
      userId_date: { userId: session.user.id, date },
    },
    update: {
      content: content.trim(),
      amount: amount != null ? Math.round(amount) : null,
      note: note?.trim() || null,
    },
    create: {
      userId: session.user.id,
      date,
      content: content.trim(),
      amount: amount != null ? Math.round(amount) : null,
      note: note?.trim() || null,
    },
  });

  return NextResponse.json(entry);
}
