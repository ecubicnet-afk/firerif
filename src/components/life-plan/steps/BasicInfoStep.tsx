"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LifePlanInput } from "@/types/life-plan";

interface Props {
  data: LifePlanInput;
  onChange: (data: Partial<LifePlanInput>) => void;
}

export function BasicInfoStep({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="currentAge" className="text-sm font-bold">
          現在の年齢
        </Label>
        <Input
          id="currentAge"
          type="number"
          min={0}
          max={120}
          value={data.currentAge}
          onChange={(e) => onChange({ currentAge: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="retirementAge" className="text-sm font-bold">
          退職予定年齢
        </Label>
        <Input
          id="retirementAge"
          type="number"
          min={0}
          max={120}
          value={data.retirementAge}
          onChange={(e) => onChange({ retirementAge: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lifeExpectancy" className="text-sm font-bold">
          想定寿命
        </Label>
        <Input
          id="lifeExpectancy"
          type="number"
          min={0}
          max={120}
          value={data.lifeExpectancy}
          onChange={(e) => onChange({ lifeExpectancy: Number(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">
          日本人の平均寿命は男性81歳、女性87歳。余裕を持って90歳推奨。
        </p>
      </div>
    </div>
  );
}
