"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Calendar, Coins, Flame } from "lucide-react";
import { formatYen } from "@/lib/utils";

interface VisionItem {
  id: string;
  title: string;
  description: string | null;
  hasImage: boolean;
  targetDate: string | null;
  targetAmount: number | null;
  sortOrder: number;
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// Pin color palette — cycles through 5 colors
const PIN_COLORS = [
  { from: "from-red-400", to: "to-red-600", border: "border-red-700/30", shadow: "shadow-red-900/30" },
  { from: "from-blue-400", to: "to-blue-600", border: "border-blue-700/30", shadow: "shadow-blue-900/30" },
  { from: "from-emerald-400", to: "to-emerald-600", border: "border-emerald-700/30", shadow: "shadow-emerald-900/30" },
  { from: "from-amber-400", to: "to-amber-600", border: "border-amber-700/30", shadow: "shadow-amber-900/30" },
  { from: "from-purple-400", to: "to-purple-600", border: "border-purple-700/30", shadow: "shadow-purple-900/30" },
];

export function VisionCard({
  item,
  index,
  onDelete,
}: {
  item: VisionItem;
  index: number;
  onDelete: (id: string) => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const days = item.targetDate ? daysUntil(item.targetDate) : null;
  const isAchieved = days !== null && days <= 0;

  // Deterministic pseudo-random rotation: range -3 to +3 degrees
  const rotation = ((index * 7 + 3) % 7) - 3;
  const pin = PIN_COLORS[index % PIN_COLORS.length];

  // First card spans 2 cols on large screens
  const isFeature = index === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95, rotate: 0 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: rotation }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ scale: 1.02, y: -6, zIndex: 20 }}
      className={`
        group relative overflow-visible pt-4
        ${isFeature ? "lg:col-span-2" : ""}
      `}
    >
      {/* Push Pin */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10" aria-hidden="true">
        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${pin.from} ${pin.to} shadow-md ${pin.shadow} border ${pin.border} relative`}>
          {/* Highlight */}
          <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-white/40" />
        </div>
        {/* Pin needle shadow */}
        <div className="w-0.5 h-1.5 bg-gray-400/30 mx-auto rounded-b-full" />
      </div>

      {/* Card body */}
      <div className="rounded-lg overflow-hidden bg-card border shadow-[2px_4px_12px_rgba(0,0,0,0.1)] hover:shadow-[4px_8px_20px_rgba(0,0,0,0.15)] transition-shadow duration-300">

        {/* Image */}
        {item.hasImage ? (
          <div className={`relative overflow-hidden ${isFeature ? "aspect-[16/10]" : "aspect-video"}`}>
            {/* Shimmer skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/vision/${item.id}/image`}
              alt={item.title}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            {/* Overlay content on image */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className={`font-bold text-white drop-shadow-lg ${isFeature ? "text-2xl" : "text-lg"}`}>
                {item.title}
              </h3>
              {item.description && (
                <p className="text-white/80 text-sm mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className={`${isFeature ? "p-8" : "p-5"} flex flex-col justify-center min-h-[120px]`}>
            <div className="flex items-center gap-2 mb-2">
              <Flame className={`${isFeature ? "w-7 h-7" : "w-5 h-5"} text-primary`} />
              <h3 className={`font-bold ${isFeature ? "text-2xl" : "text-lg"}`}>
                {item.title}
              </h3>
            </div>
            {item.description && (
              <p className="text-muted-foreground text-sm line-clamp-3">
                {item.description}
              </p>
            )}
          </div>
        )}

        {/* Meta info bar */}
        <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
          {days !== null && (
            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
              isAchieved
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : days <= 30
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            }`}>
              <Calendar className="w-3 h-3" />
              {isAchieved ? "達成日到来!" : `あと${days}日`}
            </div>
          )}

          {item.targetAmount && (
            <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
              <Coins className="w-3 h-3" />
              目標: {formatYen(item.targetAmount)}
            </div>
          )}

          <div className="flex-1" />

          <button
            onClick={() => onDelete(item.id)}
            aria-label={`${item.title}を削除`}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        {item.targetAmount && (
          <div className="px-4 pb-3">
            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "30%" }}
                transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                className="h-full rounded-full bg-primary"
              />
            </div>
          </div>
        )}

        {/* Achievement glow */}
        {isAchieved && (
          <div className="absolute inset-0 rounded-lg ring-2 ring-emerald-400/50 pointer-events-none" />
        )}
      </div>
    </motion.div>
  );
}
