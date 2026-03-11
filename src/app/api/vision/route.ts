import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const items = await prisma.visionItem.findMany({
    where: { userId: session.user.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const { title, description, imageUrl, targetDate, targetAmount } =
    await request.json();

  if (!title) {
    return NextResponse.json(
      { error: "タイトルを入力してください" },
      { status: 400 }
    );
  }

  const item = await prisma.visionItem.create({
    data: {
      userId: session.user.id,
      title,
      description: description || null,
      imageUrl: imageUrl || null,
      targetDate: targetDate ? new Date(targetDate) : null,
      targetAmount: targetAmount ? Math.round(targetAmount) : null,
    },
  });

  return NextResponse.json(item);
}
