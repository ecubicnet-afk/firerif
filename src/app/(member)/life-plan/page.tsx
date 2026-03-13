"use client";

import { useState, useEffect, useCallback } from "react";
import { CalendarRange, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";

const PlanWizard = dynamic(() => import("@/components/life-plan/PlanWizard").then(m => ({ default: m.PlanWizard })), {
  loading: () => <div className="animate-pulse bg-muted rounded-lg h-96" />,
});
import { DEFAULT_LIFE_PLAN } from "@/lib/life-plan-constants";
import type { LifePlanInput } from "@/types/life-plan";

interface SavedPlan {
  id: string;
  name: string;
  data: LifePlanInput;
  updatedAt: string;
}

export default function LifePlanPage() {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [activePlan, setActivePlan] = useState<SavedPlan | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/life-plan");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  async function handleSave(data: LifePlanInput) {
    setSaving(true);
    try {
      if (activePlan) {
        // Update
        await fetch("/api/life-plan", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activePlan.id, data }),
        });
      } else {
        // Create new
        await fetch("/api/life-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "マイプラン", data }),
        });
      }
      setIsNew(false);
      setActivePlan(null);
      fetchPlans();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("このプランを削除しますか？")) return;
    await fetch(`/api/life-plan?id=${id}`, { method: "DELETE" });
    if (activePlan?.id === id) {
      setActivePlan(null);
    }
    fetchPlans();
  }

  function handleNew() {
    setActivePlan(null);
    setIsNew(true);
  }

  function handleSelectPlan(plan: SavedPlan) {
    setActivePlan(plan);
    setIsNew(false);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  // Show wizard if editing or creating
  if (isNew || activePlan) {
    return (
      <div className="max-w-5xl mx-auto space-y-4 pb-24">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActivePlan(null);
              setIsNew(false);
            }}
          >
            ← 一覧に戻る
          </Button>
          <h1 className="text-lg font-bold">
            {activePlan ? activePlan.name : "新しいライフプラン"}
          </h1>
        </div>

        <PlanWizard
          initialData={activePlan?.data ?? DEFAULT_LIFE_PLAN}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    );
  }

  // Plan list
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div>
        <div className="flex items-center gap-2">
          <CalendarRange className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold">ライフプラン</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          家族構成や収支をもとに、生涯の資金をシミュレーション
        </p>
      </div>

      <Button onClick={handleNew}>
        <Plus className="w-4 h-4 mr-1.5" />
        新しいプランを作成
      </Button>

      {plans.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <CalendarRange className="h-12 w-12 mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">
            まだプランがありません。「新しいプランを作成」から始めましょう。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
              onClick={() => handleSelectPlan(plan)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{plan.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(plan.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                更新: {new Date(plan.updatedAt).toLocaleDateString("ja-JP")}
              </p>
              {plan.data && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(plan.data as LifePlanInput).currentAge}歳 →{" "}
                  {(plan.data as LifePlanInput).retirementAge}歳退職 →{" "}
                  {(plan.data as LifePlanInput).lifeExpectancy}歳
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
