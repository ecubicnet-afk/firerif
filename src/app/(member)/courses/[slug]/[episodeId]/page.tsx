import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { VideoPlayer } from "@/components/video/video-player";
import { Markdown } from "@/components/markdown";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function EpisodePage({
  params,
}: {
  params: Promise<{ slug: string; episodeId: string }>;
}) {
  const { slug, episodeId } = await params;

  const course = await prisma.videoCourse.findUnique({
    where: { slug },
    include: {
      episodes: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!course) {
    notFound();
  }

  const currentIndex = course.episodes.findIndex((e) => e.id === episodeId);
  const episode = course.episodes[currentIndex];

  if (!episode) {
    notFound();
  }

  const prevEpisode = currentIndex > 0 ? course.episodes[currentIndex - 1] : null;
  const nextEpisode =
    currentIndex < course.episodes.length - 1
      ? course.episodes[currentIndex + 1]
      : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href={`/courses/${slug}`}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {course.title}に戻る
        </Link>
        <h1 className="text-xl font-bold">
          第{currentIndex + 1}回: {episode.title}
        </h1>
      </div>

      <VideoPlayer url={episode.videoUrl} title={episode.title} />

      {episode.description && (
        <div className="prose prose-sm max-w-none">
          <p className="text-muted-foreground">{episode.description}</p>
        </div>
      )}

      {episode.body && (
        <div className="border-t pt-6">
          <Markdown>{episode.body}</Markdown>
        </div>
      )}

      <div className="flex justify-between">
        {prevEpisode ? (
          <Link href={`/courses/${slug}/${prevEpisode.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              前の動画
            </Button>
          </Link>
        ) : (
          <div />
        )}
        {nextEpisode ? (
          <Link href={`/courses/${slug}/${nextEpisode.id}`}>
            <Button variant="outline" size="sm">
              次の動画
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
