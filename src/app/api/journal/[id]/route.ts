import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
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
  const existing = await prisma.journalEntry.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "データが見つかりません" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const updated = await prisma.journalEntry.update({
    where: { id },
    data: {
      ...(body.content !== undefined && { content: body.content.trim() }),
      ...(body.amount !== undefined && {
        amount: body.amount != null ? Math.round(body.amount) : null,
      }),
      ...(body.note !== undefined && { note: body.note?.trim() || null }),
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
  const existing = await prisma.journalEntry.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "データが見つかりません" },
      { status: 404 }
    );
  }

  await prisma.journalEntry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
