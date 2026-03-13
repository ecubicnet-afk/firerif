"use client";

import { motion } from "framer-motion";
import { Trash2, Calendar, Coins, Flame } from "lucide-react";
import { formatYen } from "@/lib/utils";

interface VisionItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
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

export function VisionCard({
  item,
  index,
  onDelete,
}: {
  item: VisionItem;
  index: number;
  onDelete: (id: string) => void;
}) {
  const days = item.targetDate ? daysUntil(item.targetDate) : null;
  const isAchieved = days !== null && days <= 0;
  // Bento grid: first card spans 2 cols on desktop
  const isFeature = index === 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`
        group relative overflow-hidden rounded-2xl
        bg-white/10 backdrop-blur-xl border border-white/20
        shadow-lg hover:shadow-2xl hover:shadow-amber-500/10
        transition-shadow duration-300
        ${isFeature ? "md:col-span-2 md:row-span-2" : ""}
      `}
    >
      {/* Image */}
      {item.imageUrl ? (
        <div className={`relative overflow-hidden ${isFeature ? "aspect-[16/10]" : "aspect-video"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

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
        <div className={`${isFeature ? "p-8" : "p-5"} flex flex-col justify-center min-h-[120px] bg-gradient-to-br from-amber-500/10 to-blue-500/10`}>
          <div className="flex items-center gap-2 mb-2">
            <Flame className={`${isFeature ? "w-7 h-7" : "w-5 h-5"} text-amber-500`} />
            <h3 className={`font-bold text-slate-800 dark:text-white ${isFeature ? "text-2xl" : "text-lg"}`}>
              {item.title}
            </h3>
          </div>
          {item.description && (
            <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3">
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
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : days <= 30
                ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
          }`}>
            <Calendar className="w-3 h-3" />
            {isAchieved ? "達成日到来!" : `あと${days}日`}
          </div>
        )}

        {item.targetAmount && (
          <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">
            <Coins className="w-3 h-3" />
            目標: {formatYen(item.targetAmount)}
          </div>
        )}

        <div className="flex-1" />

        <button
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-500"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar (if targetAmount set) */}
      {item.targetAmount && (
        <div className="px-4 pb-3">
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "30%" }}
              transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
            />
          </div>
        </div>
      )}

      {/* Achievement glow */}
      {isAchieved && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-400/50 pointer-events-none" />
      )}
    </motion.div>
  );
}
