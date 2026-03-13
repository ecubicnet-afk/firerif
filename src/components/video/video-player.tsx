"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Convert YouTube watch URLs to embed URLs
  let embedUrl = url;
  let videoId: string | null = null;
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/
  );
  if (youtubeMatch) {
    videoId = youtubeMatch[1];
    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  const handlePlay = useCallback(() => setIsPlaying(true), []);

  // Show thumbnail for YouTube videos until clicked
  if (videoId && !isPlaying) {
    return (
      <div
        className="relative w-full aspect-video rounded-lg overflow-hidden bg-black cursor-pointer group"
        onClick={handlePlay}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handlePlay()}
        aria-label={title ? `${title}を再生` : "動画を再生"}
      >
        <Image
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={title || "動画サムネイル"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
      <iframe
        src={embedUrl}
        title={title || "動画プレーヤー"}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
