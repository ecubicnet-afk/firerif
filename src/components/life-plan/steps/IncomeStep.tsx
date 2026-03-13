"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LifePlanInput } from "@/types/life-plan";

interface Props {
  data: LifePlanInput;
  onChange: (data: Partial<LifePlanInput>) => void;
}

export function IncomeStep({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="annualIncome" className="text-sm font-bold">
          手取り年収（万円）
        </Label>
        <Input
          id="annualIncome"
          type="number"
          min={0}
          value={data.annualIncome}
          onChange={(e) => onChange({ annualIncome: Number(e.target.value) })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="salaryGrowth" className="text-sm font-bold">
          昇給率（%/年）
        </Label>
        <Input
          id="salaryGrowth"
          type="number"
          min={0}
          max={30}
          step={0.1}
          value={data.salaryGrowthRate}
          onChange={(e) =>
            onChange({ salaryGrowthRate: Number(e.target.value) })
          }
        />
        <p className="text-xs text-muted-foreground">
          日本の平均昇給率は約1〜2%
        </p>
      </div>

      {data.spouse && (
        <div className="space-y-1.5">
          <Label htmlFor="spouseIncome" className="text-sm font-bold">
            配偶者の手取り年収（万円）
          </Label>
          <Input
            id="spouseIncome"
            type="number"
            min={0}
            value={data.spouseIncome}
            onChange={(e) => onChange({ spouseIncome: Number(e.target.value) })}
          />
        </div>
      )}

      <div className="border-t pt-4 space-y-4">
        <h4 className="text-sm font-bold text-muted-foreground">年金設定</h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pensionAge" className="text-xs">
              受給開始年齢
            </Label>
            <Input
              id="pensionAge"
              type="number"
              min={60}
              max={75}
              value={data.pensionStartAge}
              onChange={(e) =>
                onChange({ pensionStartAge: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="monthlyPension" className="text-xs">
              月額年金（万円）
            </Label>
            <Input
              id="monthlyPension"
              type="number"
              min={0}
              step={0.5}
              value={data.monthlyPension}
              onChange={(e) =>
                onChange({ monthlyPension: Number(e.target.value) })
              }
            />
          </div>
        </div>

        {data.spouse && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="spPensionAge" className="text-xs">
                配偶者の受給開始年齢
              </Label>
              <Input
                id="spPensionAge"
                type="number"
                min={60}
                max={75}
                value={data.spousePensionStartAge}
                onChange={(e) =>
                  onChange({
                    spousePensionStartAge: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="spMonthlyPension" className="text-xs">
                配偶者の月額年金（万円）
              </Label>
              <Input
                id="spMonthlyPension"
                type="number"
                min={0}
                step={0.5}
                value={data.spouseMonthlyPension}
                onChange={(e) =>
                  onChange({
                    spouseMonthlyPension: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          厚生年金の平均受給額は月14〜15万円。国民年金のみの場合は月6.5万円程度。
        </p>
      </div>
    </div>
  );
}
