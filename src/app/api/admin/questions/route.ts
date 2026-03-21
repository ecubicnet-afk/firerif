import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const questions = await prisma.question.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(questions);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await request.json();
  const { id, status } = body;

  if (!id || !status) {
    return NextResponse.json(
      { error: "IDとステータスは必須です" },
      { status: 400 }
    );
  }

  if (!["PENDING", "SYNCED", "ANSWERED"].includes(status)) {
    return NextResponse.json(
      { error: "無効なステータスです" },
      { status: 400 }
    );
  }

  const updated = await prisma.question.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updated);
}
