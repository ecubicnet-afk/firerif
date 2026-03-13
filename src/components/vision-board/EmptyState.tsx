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
        className="w-24 h-24 rounded-lg bg-[#faf6f0] dark:bg-[#3a3530] border border-[#e8dcc8] dark:border-[#554e44] shadow-md bg-paper flex items-center justify-center mb-6"
      >
        <Sparkles className="w-10 h-10 text-amber-500" />
      </motion.div>
      <h3 className="text-xl font-bold text-amber-950 dark:text-amber-200 mb-2">
        理想の未来をピン留めしよう
      </h3>
      <p className="text-sm text-amber-900/60 dark:text-amber-300/60 text-center max-w-md mb-6">
        FIRE後にやりたいこと、手に入れたいものを
        コルクボードにピン留めしましょう。
        毎日眺めることで、目標達成への意欲が高まります。
      </p>
      <Button
        onClick={onAdd}
        className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white shadow-lg shadow-amber-800/25"
      >
        <Plus className="w-4 h-4 mr-1.5" />
        最初のビジョンをピン留め
      </Button>
    </motion.div>
  );
}
