import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const course = await prisma.videoCourse.findUnique({
    where: { slug },
    include: {
      episodes: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        {course.description && (
          <p className="text-muted-foreground mt-1">{course.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          全{course.episodes.length}本
        </p>
      </div>

      <div className="space-y-2">
        {course.episodes.map((episode, index) => (
          <Link
            key={episode.id}
            href={`/courses/${slug}/${episode.id}`}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{episode.title}</p>
                  {episode.description && (
                    <p className="text-sm text-muted-foreground truncate">
                      {episode.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {episode.isFree && (
                    <Badge variant="secondary">無料</Badge>
                  )}
                  {episode.duration && (
                    <span className="text-xs text-muted-foreground">
                      {Math.floor(episode.duration / 60)}分
                    </span>
                  )}
                  <PlayCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
