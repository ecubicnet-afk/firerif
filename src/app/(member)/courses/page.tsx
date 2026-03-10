import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Video } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const courses = await prisma.videoCourse.findMany({
    include: { episodes: { select: { id: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">動画コース</h1>
        <p className="text-muted-foreground mt-1">
          FIREに必要な知識を体系的に学べる動画コースです
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.slug}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>
                      {course.episodes.length}本の動画
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {course.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {course.description}
                  </p>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            現在準備中です。しばらくお待ちください。
          </CardContent>
        </Card>
      )}
    </div>
  );
}
