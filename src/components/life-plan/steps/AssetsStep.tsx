"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LifePlanInput } from "@/types/life-plan";

interface Props {
  data: LifePlanInput;
  onChange: (data: Partial<LifePlanInput>) => void;
}

export function AssetsStep({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="currentAssets" className="text-sm font-bold">
          現在の金融資産（万円）
        </Label>
        <Input
          id="currentAssets"
          type="number"
          min={0}
          value={data.currentAssets}
          onChange={(e) => onChange({ currentAssets: Number(e.target.value) })}
        />
        <p className="text-xs text-muted-foreground">
          預貯金、株式、投資信託等の合計
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="investmentReturn" className="text-sm font-bold">
          想定運用利回り（%/年）
        </Label>
        <Input
          id="investmentReturn"
          type="number"
          min={0}
          max={30}
          step={0.1}
          value={data.investmentReturn}
          onChange={(e) =>
            onChange({ investmentReturn: Number(e.target.value) })
          }
        />
        <p className="text-xs text-muted-foreground">
          インデックス投資の長期平均は5〜7%程度。保守的に3%推奨。
        </p>
      </div>

      <div className="border-t pt-4 space-y-4">
        <h4 className="text-sm font-bold text-muted-foreground">生活費設定</h4>

        <div className="space-y-1.5">
          <Label htmlFor="annualLivingCost" className="text-xs font-bold">
            年間生活費（万円・住居費除く）
          </Label>
          <Input
            id="annualLivingCost"
            type="number"
            min={0}
            value={data.annualLivingCost}
            onChange={(e) =>
              onChange({ annualLivingCost: Number(e.target.value) })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="retiredRatio" className="text-xs font-bold">
            退職後の生活費比率（%）
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="retiredRatio"
              type="number"
              min={0}
              max={200}
              step={5}
              value={Math.round(data.retiredLivingCostRatio * 100)}
              onChange={(e) =>
                onChange({
                  retiredLivingCostRatio: Number(e.target.value) / 100,
                })
              }
              className="w-24"
            />
            <span className="text-xs text-muted-foreground">
              ={" "}
              {Math.round(
                data.annualLivingCost * data.retiredLivingCostRatio
              )}
              万円/年
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            一般的に退職後は現役時の70%程度
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="inflation" className="text-xs font-bold">
            インフレ率（%/年）
          </Label>
          <Input
            id="inflation"
            type="number"
            min={0}
            max={10}
            step={0.1}
            value={data.inflationRate}
            onChange={(e) => onChange({ inflationRate: Number(e.target.value) })}
          />
          <p className="text-xs text-muted-foreground">
            日銀の物価安定目標は2%。保守的に1%推奨。
          </p>
        </div>
      </div>
    </div>
  );
}
