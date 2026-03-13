"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import type { LifePlanInput, LifeEvent, LifeEventType } from "@/types/life-plan";
import { EVENT_PRESETS } from "@/lib/life-plan-constants";

interface Props {
  data: LifePlanInput;
  onChange: (data: Partial<LifePlanInput>) => void;
}

export function EventsStep({ data, onChange }: Props) {
  function addEvent(type: LifeEventType) {
    const preset = EVENT_PRESETS[type];
    const newEvent: LifeEvent = {
      id: crypto.randomUUID(),
      type,
      label: preset.label,
      amount: preset.defaultAmount,
      ageAtEvent: data.currentAge + 5,
      isRecurring: !!preset.defaultInterval,
      intervalYears: preset.defaultInterval,
    };
    onChange({ events: [...data.events, newEvent] });
  }

  function removeEvent(id: string) {
    onChange({ events: data.events.filter((e) => e.id !== id) });
  }

  function updateEvent(id: string, updates: Partial<LifeEvent>) {
    onChange({
      events: data.events.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    });
  }

  return (
    <div className="space-y-5">
      {/* プリセットボタン */}
      <div>
        <Label className="text-sm font-bold mb-2 block">
          イベントを追加
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {(Object.entries(EVENT_PRESETS) as [LifeEventType, (typeof EVENT_PRESETS)[LifeEventType]][]).map(
            ([type, preset]) => (
              <Button
                key={type}
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => addEvent(type)}
              >
                {preset.icon} {preset.label}
              </Button>
            )
          )}
        </div>
      </div>

      {/* イベント一覧 */}
      {data.events.length === 0 ? (
        <p className="text-xs text-muted-foreground py-4 text-center">
          上のボタンからライフイベントを追加してください
        </p>
      ) : (
        <div className="space-y-3">
          {data.events.map((event) => {
            const preset = EVENT_PRESETS[event.type];
            return (
              <div
                key={event.id}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">
                    {preset.icon} {event.label}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEvent(event.id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">金額（万円）</Label>
                    <Input
                      type="number"
                      min={0}
                      value={event.amount}
                      onChange={(e) =>
                        updateEvent(event.id, {
                          amount: Number(e.target.value),
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">発生年齢</Label>
                    <Input
                      type="number"
                      min={data.currentAge}
                      max={data.lifeExpectancy}
                      value={event.ageAtEvent}
                      onChange={(e) =>
                        updateEvent(event.id, {
                          ageAtEvent: Number(e.target.value),
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={event.isRecurring}
                      onChange={(e) =>
                        updateEvent(event.id, {
                          isRecurring: e.target.checked,
                          intervalYears: e.target.checked ? 1 : undefined,
                        })
                      }
                      className="rounded"
                    />
                    繰り返し
                  </label>
                  {event.isRecurring && (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={event.intervalYears ?? 1}
                        onChange={(e) =>
                          updateEvent(event.id, {
                            intervalYears: Number(e.target.value),
                          })
                        }
                        className="h-7 w-16 text-xs"
                      />
                      <span className="text-xs text-muted-foreground">
                        年ごと
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
