"use client";

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  // Convert YouTube watch URLs to embed URLs
  let embedUrl = url;
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
  );
  if (youtubeMatch) {
    embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
      <iframe
        src={embedUrl}
        title={title || "動画プレーヤー"}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
