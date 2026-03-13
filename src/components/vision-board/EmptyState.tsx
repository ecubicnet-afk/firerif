"use client";

import { motion } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400/20 to-blue-400/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-6"
      >
        <Sparkles className="w-10 h-10 text-amber-500" />
      </motion.div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
        理想の未来を描こう
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-md mb-6">
        FIRE後にやりたいこと、手に入れたいものを
        ビジョンボードに追加しましょう。
        毎日眺めることで、目標達成への意欲が高まります。
      </p>
      <Button
        onClick={onAdd}
        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        最初のビジョンを追加
      </Button>
    </motion.div>
  );
}
