import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/video/video-player";
import { formatDateTime } from "@/lib/utils";
import { Radio, Calendar } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function LivePage() {
  const now = new Date();

  const liveNow = await prisma.liveStream.findFirst({
    where: { isLive: true },
    orderBy: { scheduledAt: "desc" },
  });

  const upcoming = await prisma.liveStream.findMany({
    where: {
      scheduledAt: { gte: now },
      isLive: false,
    },
    orderBy: { scheduledAt: "asc" },
    take: 10,
  });

  const past = await prisma.liveStream.findMany({
    where: {
      scheduledAt: { lt: now },
      isLive: false,
    },
    orderBy: { scheduledAt: "desc" },
    take: 10,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ライブ配信</h1>
        <p className="text-muted-foreground mt-1">
          月2回のライブ配信でリアルタイムに学べます
        </p>
      </div>

      {liveNow && liveNow.embedUrl && (
        <Card className="border-red-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500">LIVE</Badge>
              <CardTitle>{liveNow.title}</CardTitle>
            </div>
            {liveNow.description && (
              <CardDescription>{liveNow.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <VideoPlayer url={liveNow.embedUrl} title={liveNow.title} />
          </CardContent>
        </Card>
      )}

      {!liveNow && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 gap-3">
            <Radio className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              現在ライブ配信中ではありません
            </p>
          </CardContent>
        </Card>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">今後の配信予定</h2>
          {upcoming.map((stream) => (
            <Card key={stream.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">{stream.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(stream.scheduledAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">過去の配信</h2>
          {past.map((stream) => (
            <Card key={stream.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div>
                  <p className="font-medium">{stream.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(stream.scheduledAt)}
                  </p>
                </div>
                {stream.embedUrl && (
                  <Badge variant="outline" className="ml-auto shrink-0">
                    アーカイブあり
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
