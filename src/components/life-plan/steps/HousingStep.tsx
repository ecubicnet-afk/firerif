"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { LifePlanInput } from "@/types/life-plan";

interface Props {
  data: LifePlanInput;
  onChange: (data: Partial<LifePlanInput>) => void;
}

export function HousingStep({ data, onChange }: Props) {
  const isRent = data.housing.type === "rent";

  function setType(type: "rent" | "own") {
    onChange({
      housing: {
        type,
        ...(type === "rent"
          ? { monthlyRent: 10, renewalFee: 10 }
          : {
              loanBalance: 3000,
              loanRate: 1.0,
              loanYearsLeft: 30,
              propertyTax: 15,
              maintenanceCost: 12,
            }),
      },
    });
  }

  function updateHousing(updates: Partial<LifePlanInput["housing"]>) {
    onChange({ housing: { ...data.housing, ...updates } });
  }

  return (
    <div className="space-y-5">
      {/* 住居タイプ切り替え */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={isRent ? "default" : "outline"}
          size="sm"
          onClick={() => setType("rent")}
        >
          🏢 賃貸
        </Button>
        <Button
          type="button"
          variant={!isRent ? "default" : "outline"}
          size="sm"
          onClick={() => setType("own")}
        >
          🏠 持ち家
        </Button>
      </div>

      {isRent ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="monthlyRent" className="text-sm font-bold">
              月額家賃（万円）
            </Label>
            <Input
              id="monthlyRent"
              type="number"
              min={0}
              step={0.5}
              value={data.housing.monthlyRent ?? 0}
              onChange={(e) =>
                updateHousing({ monthlyRent: Number(e.target.value) })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="renewalFee" className="text-sm font-bold">
              更新料（万円・2年ごと）
            </Label>
            <Input
              id="renewalFee"
              type="number"
              min={0}
              value={data.housing.renewalFee ?? 0}
              onChange={(e) =>
                updateHousing({ renewalFee: Number(e.target.value) })
              }
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="loanBalance" className="text-xs font-bold">
                ローン残高（万円）
              </Label>
              <Input
                id="loanBalance"
                type="number"
                min={0}
                value={data.housing.loanBalance ?? 0}
                onChange={(e) =>
                  updateHousing({ loanBalance: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="loanRate" className="text-xs font-bold">
                金利（%）
              </Label>
              <Input
                id="loanRate"
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={data.housing.loanRate ?? 0}
                onChange={(e) =>
                  updateHousing({ loanRate: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="loanYears" className="text-xs font-bold">
              残り返済期間（年）
            </Label>
            <Input
              id="loanYears"
              type="number"
              min={0}
              max={50}
              value={data.housing.loanYearsLeft ?? 0}
              onChange={(e) =>
                updateHousing({ loanYearsLeft: Number(e.target.value) })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="propertyTax" className="text-xs font-bold">
                固定資産税（万円/年）
              </Label>
              <Input
                id="propertyTax"
                type="number"
                min={0}
                value={data.housing.propertyTax ?? 0}
                onChange={(e) =>
                  updateHousing({ propertyTax: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maintenance" className="text-xs font-bold">
                修繕積立（万円/年）
              </Label>
              <Input
                id="maintenance"
                type="number"
                min={0}
                value={data.housing.maintenanceCost ?? 0}
                onChange={(e) =>
                  updateHousing({ maintenanceCost: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
