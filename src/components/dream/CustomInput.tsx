"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Delete, X } from "lucide-react";
import { formatYen } from "@/lib/utils";
import { CATEGORIES } from "@/lib/dream-constants";

interface CustomInputProps {
  onSave: (amount: number, categoryId: string, categoryLabel: string, categoryIcon: string) => void;
  onCancel: () => void;
}

export function CustomInput({ onSave, onCancel }: CustomInputProps) {
  const [amount, setAmount] = useState("0");
  const [categoryId, setCategoryId] = useState<string>("");

  function handleKey(key: string) {
    setAmount((prev) => {
      if (key === "C") return "0";
      if (key === "DEL") return prev.length <= 1 ? "0" : prev.slice(0, -1);
      if (prev === "0") return key;
      if (prev.length >= 8) return prev;
      return prev + key;
    });
  }

  function handleSave() {
    const num = parseInt(amount);
    if (num <= 0 || !categoryId) return;
    const cat = CATEGORIES.find((c) => c.id === categoryId)!;
    onSave(num, categoryId, cat.label, cat.icon);
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DEL"];

  return (
    <Card className="border-primary/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">金額を入力</span>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Amount display */}
        <div className="text-center py-2 bg-muted rounded-lg">
          <span className="text-2xl font-bold">{formatYen(parseInt(amount) || 0)}</span>
        </div>

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-1.5">
          {keys.map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className="h-11 rounded-lg bg-muted hover:bg-accent font-medium text-lg transition-colors active:scale-95 flex items-center justify-center"
            >
              {key === "DEL" ? <Delete className="h-5 w-5" /> : key}
            </button>
          ))}
        </div>

        {/* Category selector */}
        <div>
          <span className="text-xs font-medium text-muted-foreground">カテゴリ</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`
                  flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors
                  ${categoryId === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-accent"
                  }
                `}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          disabled={parseInt(amount) <= 0 || !categoryId}
          onClick={handleSave}
        >
          記録する
        </Button>
      </CardContent>
    </Card>
  );
}
