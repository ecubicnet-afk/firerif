import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await request.json();
  const { submissionId, status, feedback } = body;

  if (!submissionId || !status) {
    return NextResponse.json(
      { error: "提出物IDとステータスは必須です" },
      { status: 400 }
    );
  }

  if (!["SUBMITTED", "REVIEWED", "COMPLETED"].includes(status)) {
    return NextResponse.json(
      { error: "無効なステータスです" },
      { status: 400 }
    );
  }

  const updated = await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      status,
      feedback: feedback?.trim() || null,
    },
  });

  return NextResponse.json(updated);
}
