import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse(null, { status: 401 });
  }

  const { id } = await params;

  const item = await prisma.visionItem.findFirst({
    where: { id, userId: session.user.id },
    select: { imageUrl: true },
  });

  if (!item?.imageUrl) {
    return new NextResponse(null, { status: 404 });
  }

  const imageUrl = item.imageUrl;

  // Handle Base64 data URIs (e.g. "data:image/jpeg;base64,...")
  if (imageUrl.startsWith("data:")) {
    const match = imageUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!match) {
      return new NextResponse(null, { status: 404 });
    }
    const contentType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
        "Content-Length": buffer.length.toString(),
      },
    });
  }

  // Handle external URLs — redirect to them
  if (imageUrl.startsWith("http")) {
    return NextResponse.redirect(imageUrl, {
      headers: {
        "Cache-Control": "public, max-age=604800",
      },
    });
  }

  return new NextResponse(null, { status: 404 });
}
