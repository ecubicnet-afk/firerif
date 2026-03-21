import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  appendQuestionToSheet,
  formatSheetsError,
} from "@/lib/google-sheets";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const pendingQuestions = await prisma.question.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (pendingQuestions.length === 0) {
    return NextResponse.json({ synced: 0, total: 0 });
  }

  let synced = 0;
  const errors: string[] = [];

  for (const q of pendingQuestions) {
    try {
      await appendQuestionToSheet(
        q.id,
        q.user.email,
        q.content,
        q.createdAt.toISOString()
      );

      await prisma.question.update({
        where: { id: q.id },
        data: { status: "SYNCED" },
      });

      synced++;
    } catch (error) {
      const message = formatSheetsError(error);
      console.error(`Failed to sync question ${q.id}:`, message);
      errors.push(message);
    }
  }

  return NextResponse.json({ synced, total: pendingQuestions.length, errors });
}
