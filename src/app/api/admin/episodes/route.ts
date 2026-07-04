import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { courseId, title, description, body, videoUrl, thumbnailUrl, duration, sortOrder, isFree } =
    await request.json();

  const episode = await prisma.episode.create({
    data: {
      courseId,
      title,
      description,
      body,
      videoUrl,
      thumbnailUrl,
      duration,
      sortOrder: sortOrder || 0,
      isFree: isFree || false,
    },
  });

  return NextResponse.json(episode);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "権限がありません" }, { status: 403 });
  }

  const { id, title, description, body, videoUrl, thumbnailUrl, duration, sortOrder, isFree } =
    await request.json();

  if (!id) {
    return NextResponse.json({ error: "idが必要です" }, { status: 400 });
  }

  const episode = await prisma.episode.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(body !== undefined && { body }),
      ...(videoUrl !== undefined && { videoUrl }),
      ...(thumbnailUrl !== undefined && { thumbnailUrl }),
      ...(duration !== undefined && { duration }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isFree !== undefined && { isFree }),
    },
  });

  return NextResponse.json(episode);
}
