"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { VisionCard } from "@/components/vision-board/VisionCard";
import { EmptyState } from "@/components/vision-board/EmptyState";

const VisionForm = dynamic(() => import("@/components/vision-board/VisionForm").then(m => ({ default: m.VisionForm })), {
  loading: () => <div className="animate-pulse bg-muted rounded-lg h-96" />,
});
const ConfettiEffect = dynamic(() => import("@/components/vision-board/ConfettiEffect").then(m => ({ default: m.ConfettiEffect })), {
  ssr: false,
});

interface VisionItem {
  id: string;
  title: string;
  description: string | null;
  hasImage: boolean;
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
      <ConfettiEffect trigger={confetti} />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">ビジョンボード</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            FIREした後の理想の生活をコルクボードにピン留めしよう
          </p>
        </motion.div>

        {/* Add button */}
        {loaded && items.length > 0 && !showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button onClick={() => setShowForm(true)}>
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
