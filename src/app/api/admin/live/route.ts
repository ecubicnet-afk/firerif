import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const streams = await prisma.liveStream.findMany({
    orderBy: { scheduledAt: "desc" },
  });

  return NextResponse.json(streams);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { title, description, embedUrl, scheduledAt, isLive } =
    await request.json();

  const stream = await prisma.liveStream.create({
    data: {
      title,
      description,
      embedUrl,
      scheduledAt: new Date(scheduledAt),
      isLive: isLive || false,
    },
  });

  return NextResponse.json(stream);
}
