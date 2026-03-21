import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const assignments = await prisma.assignment.findMany({
    include: {
      submissions: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(assignments);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, dueDate } = body;

  if (!title?.trim()) {
    return NextResponse.json(
      { error: "タイトルは必須です" },
      { status: 400 }
    );
  }

  const assignment = await prisma.assignment.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  return NextResponse.json(assignment);
}
