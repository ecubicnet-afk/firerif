"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import type { LifePlanInput } from "@/types/life-plan";

interface Props {
  data: LifePlanInput;
  onChange: (data: Partial<LifePlanInput>) => void;
}

export function FamilyStep({ data, onChange }: Props) {
  const hasSpouse = data.spouse !== null;

  function toggleSpouse() {
    onChange({
      spouse: hasSpouse ? null : { age: data.currentAge, retirementAge: 65 },
    });
  }

  function addChild() {
    onChange({ children: [...data.children, { age: 0 }] });
  }

  function removeChild(index: number) {
    onChange({ children: data.children.filter((_, i) => i !== index) });
  }

  function updateChildAge(index: number, age: number) {
    const updated = [...data.children];
    updated[index] = { age };
    onChange({ children: updated });
  }

  return (
    <div className="space-y-6">
      {/* 配偶者 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold">配偶者</Label>
          <Button
            type="button"
            variant={hasSpouse ? "destructive" : "outline"}
            size="sm"
            onClick={toggleSpouse}
          >
            {hasSpouse ? "なし" : "あり"}
          </Button>
        </div>

        {hasSpouse && data.spouse && (
          <div className="grid grid-cols-2 gap-3 pl-2 border-l-2 border-blue-200 dark:border-blue-800">
            <div className="space-y-1.5">
              <Label htmlFor="spouseAge" className="text-xs">
                年齢
              </Label>
              <Input
                id="spouseAge"
                type="number"
                min={0}
                max={120}
                value={data.spouse.age}
                onChange={(e) =>
                  onChange({
                    spouse: { ...data.spouse!, age: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="spouseRetAge" className="text-xs">
                退職予定年齢
              </Label>
              <Input
                id="spouseRetAge"
                type="number"
                min={0}
                max={120}
                value={data.spouse.retirementAge}
                onChange={(e) =>
                  onChange({
                    spouse: {
                      ...data.spouse!,
                      retirementAge: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* 子供 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold">
            子供 ({data.children.length}人)
          </Label>
          <Button type="button" variant="outline" size="sm" onClick={addChild}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            追加
          </Button>
        </div>

        {data.children.map((child, i) => (
          <div
            key={i}
            className="flex items-center gap-2 pl-2 border-l-2 border-green-200 dark:border-green-800"
          >
            <span className="text-xs text-muted-foreground w-12">
              第{i + 1}子
            </span>
            <Input
              type="number"
              min={0}
              max={30}
              value={child.age}
              onChange={(e) => updateChildAge(i, Number(e.target.value))}
              className="w-20"
              placeholder="年齢"
            />
            <span className="text-xs text-muted-foreground">歳</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeChild(i)}
              className="ml-auto text-muted-foreground hover:text-red-500"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}

        {data.children.length === 0 && (
          <p className="text-xs text-muted-foreground pl-2">
            子供がいる場合は「追加」を押してください。教育費が自動計算されます。
          </p>
        )}
      </div>
    </div>
  );
}
