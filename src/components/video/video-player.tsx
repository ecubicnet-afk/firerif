"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const handlePlay = useCallback(() => setIsPlaying(true), []);

  // 動画URL未設定（準備中）：壊れた黒枠ではなく「近日公開」を出す
  if (!url || url.trim() === "") {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center">
        <div className="text-center text-white px-6">
          <div className="text-4xl mb-2">🎬</div>
          <p className="font-bold text-lg">動画は近日公開</p>
          <p className="text-sm text-white/70 mt-1 leading-relaxed">
            {title ? `「${title}」` : "この動画"}は現在準備中です。<br className="hidden sm:block" />公開までもう少しお待ちください🔥
          </p>
        </div>
      </div>
    );
  }

  // Cloudflare Stream：会員限定の講座動画ホスティング。
  // 管理者が貼るURLの形が /iframe・/watch・末尾が動画IDのどれでも埋め込みに正規化する。
  const cfMatch = url.match(
    /(https:\/\/customer-[\w-]+\.cloudflarestream\.com\/[\w-]+)(?:\/(?:iframe|watch))?/
  );
  if (cfMatch) {
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={`${cfMatch[1]}/iframe`}
          title={title || "動画プレーヤー"}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

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
