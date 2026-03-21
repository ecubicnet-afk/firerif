import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { id: assignmentId } = await params;
  const body = await request.json();
  const { content } = body;

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "回答内容を入力してください" },
      { status: 400 }
    );
  }

  // Check assignment exists
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment) {
    return NextResponse.json(
      { error: "課題が見つかりません" },
      { status: 404 }
    );
  }

  // Check for existing submission
  const existing = await prisma.assignmentSubmission.findUnique({
    where: {
      assignmentId_userId: { assignmentId, userId: session.user.id },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "既に提出済みです" },
      { status: 400 }
    );
  }

  const submission = await prisma.assignmentSubmission.create({
    data: {
      assignmentId,
      userId: session.user.id,
      content: content.trim(),
    },
  });

  return NextResponse.json(submission);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { id: assignmentId } = await params;
  const body = await request.json();
  const { content } = body;

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "回答内容を入力してください" },
      { status: 400 }
    );
  }

  const existing = await prisma.assignmentSubmission.findUnique({
    where: {
      assignmentId_userId: { assignmentId, userId: session.user.id },
    },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "提出物が見つかりません" },
      { status: 404 }
    );
  }

  if (existing.status === "COMPLETED") {
    return NextResponse.json(
      { error: "完了済みの課題は再提出できません" },
      { status: 400 }
    );
  }

  const updated = await prisma.assignmentSubmission.update({
    where: { id: existing.id },
    data: {
      content: content.trim(),
      status: "SUBMITTED",
    },
  });

  return NextResponse.json(updated);
}
