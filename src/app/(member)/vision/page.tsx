"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VisionCard } from "@/components/vision-board/VisionCard";
import { VisionForm } from "@/components/vision-board/VisionForm";
import { EmptyState } from "@/components/vision-board/EmptyState";
import { ConfettiEffect } from "@/components/vision-board/ConfettiEffect";

interface VisionItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  targetDate: string | null;
  targetAmount: number | null;
  sortOrder: number;
}

export default function VisionPage() {
  const [items, setItems] = useState<VisionItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/vision");
    if (res.ok) {
      const data = await res.json();
      setItems(data);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleSubmit(data: {
    title: string;
    description: string | null;
    imageUrl: string | null;
    targetDate: string | null;
    targetAmount: number | null;
  }) {
    await fetch("/api/vision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    setConfetti(true);
    setTimeout(() => setConfetti(false), 100);
    fetchItems();
  }

  async function handleDelete(id: string) {
    if (!confirm("このビジョンを削除しますか？")) return;
    await fetch(`/api/vision/${id}`, { method: "DELETE" });
    fetchItems();
  }

  return (
    <div className="min-h-screen relative">
      {/* Cork board background */}
      <div className="fixed inset-0 -z-10 bg-cork" />

      <ConfettiEffect trigger={confetti} />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-amber-950 via-amber-800 to-amber-700 bg-clip-text text-transparent drop-shadow-sm">
            ビジョンボード
          </h1>
          <p className="text-sm text-amber-900/70 dark:text-amber-200/70 mt-1">
            FIREした後の理想の生活をコルクボードにピン留めしよう
          </p>
        </motion.div>

        {/* Add button */}
        {loaded && items.length > 0 && !showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 text-white shadow-lg shadow-amber-800/20"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              ビジョンをピン留め
            </Button>
          </motion.div>
        )}

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <VisionForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          )}
        </AnimatePresence>

        {/* Content */}
        {loaded && items.length === 0 && !showForm ? (
          <EmptyState onAdd={() => setShowForm(true)} />
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pt-2">
              {items.map((item, index) => (
                <VisionCard
                  key={item.id}
                  item={item}
                  index={index}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
