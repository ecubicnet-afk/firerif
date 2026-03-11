import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const todos = await prisma.todo.findMany({
    where: { userId: session.user.id },
    orderBy: [{ completed: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(todos);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { title, dueDate } = await request.json();

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json(
      { error: "タイトルを入力してください" },
      { status: 400 }
    );
  }

  const todo = await prisma.todo.create({
    data: {
      userId: session.user.id,
      title: title.trim(),
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  return NextResponse.json(todo);
}
