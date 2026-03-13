"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react";
import type { LifePlanInput } from "@/types/life-plan";
import { DEFAULT_LIFE_PLAN, WIZARD_STEPS } from "@/lib/life-plan-constants";
import { simulateLifePlan, summarizeLifePlan } from "@/lib/life-plan-calc";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { FamilyStep } from "./steps/FamilyStep";
import { IncomeStep } from "./steps/IncomeStep";
import { HousingStep } from "./steps/HousingStep";
import { EventsStep } from "./steps/EventsStep";
import { AssetsStep } from "./steps/AssetsStep";
import { ResultDashboard } from "./ResultDashboard";
import { NetWorthChart } from "./NetWorthChart";
import { CashFlowChart } from "./CashFlowChart";
import { EventTimeline } from "./EventTimeline";
import { YearlyTable } from "./YearlyTable";

interface Props {
  initialData?: LifePlanInput;
  onSave?: (data: LifePlanInput) => void;
  saving?: boolean;
}

export function PlanWizard({ initialData, onSave, saving }: Props) {
  const [step, setStep] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [data, setData] = useState<LifePlanInput>(
    initialData ?? DEFAULT_LIFE_PLAN
  );

  const handleChange = useCallback(
    (updates: Partial<LifePlanInput>) => {
      setData((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const projections = useMemo(() => simulateLifePlan(data), [data]);
  const summary = useMemo(
    () => summarizeLifePlan(data, projections),
    [data, projections]
  );

  const currentStep = WIZARD_STEPS[step];
  const isFirst = step === 0;
  const isLast = step === WIZARD_STEPS.length - 1;

  const stepComponent = useMemo(() => {
    switch (currentStep.id) {
      case "basic":
        return <BasicInfoStep data={data} onChange={handleChange} />;
      case "family":
        return <FamilyStep data={data} onChange={handleChange} />;
      case "income":
        return <IncomeStep data={data} onChange={handleChange} />;
      case "housing":
        return <HousingStep data={data} onChange={handleChange} />;
      case "events":
        return <EventsStep data={data} onChange={handleChange} />;
      case "assets":
        return <AssetsStep data={data} onChange={handleChange} />;
      default:
        return null;
    }
  }, [currentStep.id, data, handleChange]);

  if (showResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResult(false)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            入力に戻る
          </Button>
          {onSave && (
            <Button
              size="sm"
              onClick={() => onSave(data)}
              disabled={saving}
            >
              {saving ? "保存中..." : "プランを保存"}
            </Button>
          )}
        </div>

        <ResultDashboard summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NetWorthChart
            projections={projections}
            retirementAge={data.retirementAge}
          />
          <CashFlowChart
            projections={projections}
            retirementAge={data.retirementAge}
          />
        </div>

        <EventTimeline projections={projections} />

        <YearlyTable projections={projections} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-1">
        {WIZARD_STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              i === step
                ? "bg-primary text-primary-foreground font-bold"
                : i < step
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            <span className="hidden sm:inline">{s.icon}</span>
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sm:hidden">{i + 1}</span>
          </button>
        ))}
      </div>

      {/* Step title */}
      <div>
        <h2 className="text-lg font-bold">
          {currentStep.icon} {currentStep.label}
        </h2>
        <p className="text-xs text-muted-foreground">
          ステップ {step + 1} / {WIZARD_STEPS.length}
        </p>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="min-h-[300px]"
        >
          {stepComponent}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep((s) => s - 1)}
          disabled={isFirst}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          戻る
        </Button>

        <div className="flex gap-2">
          {/* Quick preview: show net worth summary */}
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <span>最終資産:</span>
            <span
              className={`font-bold ${
                summary.finalNetWorth >= 0
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {summary.finalNetWorth.toLocaleString()}万円
            </span>
          </div>

          {isLast ? (
            <Button size="sm" onClick={() => setShowResult(true)}>
              <BarChart3 className="w-4 h-4 mr-1" />
              結果を見る
            </Button>
          ) : (
            <Button size="sm" onClick={() => setStep((s) => s + 1)}>
              次へ
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
