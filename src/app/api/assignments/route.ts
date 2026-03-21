import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const assignments = await prisma.assignment.findMany({
    include: {
      submissions: {
        where: { userId: session.user.id },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(assignments);
}
