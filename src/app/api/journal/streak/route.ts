import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未認証" }, { status: 401 });
  }

  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    select: { date: true },
    orderBy: { date: "desc" },
  });

  const totalEntries = entries.length;

  // Calculate current streak from today backwards
  let currentStreak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split("T")[0];

    if (entries.some((e) => e.date === dateStr)) {
      currentStreak++;
    } else if (i === 0) {
      // Today has no entry, that's ok - check from yesterday
      continue;
    } else {
      break;
    }
  }

  return NextResponse.json({ currentStreak, totalEntries });
}
