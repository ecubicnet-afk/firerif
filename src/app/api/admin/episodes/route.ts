import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { courseId, title, description, videoUrl, thumbnailUrl, duration, sortOrder, isFree } =
    await request.json();

  const episode = await prisma.episode.create({
    data: {
      courseId,
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      sortOrder: sortOrder || 0,
      isFree: isFree || false,
    },
  });

  return NextResponse.json(episode);
}
