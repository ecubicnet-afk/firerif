import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users, Video, Radio, MessageCircleQuestion } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const [userCount, courseCount, streamCount, questionCount] = await Promise.all([
    prisma.user.count(),
    prisma.videoCourse.count(),
    prisma.liveStream.count(),
    prisma.question.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    { label: "会員数", value: userCount, icon: Users, href: "/admin/members" },
    { label: "コース数", value: courseCount, icon: Video, href: "/admin/courses" },
    { label: "配信数", value: streamCount, icon: Radio, href: "/admin/live" },
    { label: "未回答の質問", value: questionCount, icon: MessageCircleQuestion, href: "/admin/questions" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">管理画面</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
