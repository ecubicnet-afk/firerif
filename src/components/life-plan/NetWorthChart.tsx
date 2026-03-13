"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { YearlyProjection } from "@/types/life-plan";

interface Props {
  projections: YearlyProjection[];
  retirementAge: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: YearlyProjection }>;
}) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur border shadow-lg p-3 text-xs space-y-1">
      <p className="font-bold">
        {d.age}歳（{d.year}年）
      </p>
      <p className={d.netWorth >= 0 ? "text-emerald-600" : "text-rose-600"}>
        資産: {d.netWorth.toLocaleString()}万円
      </p>
      <p>収入: {d.income.toLocaleString()}万円</p>
      <p>支出: {(d.expense + d.housingCost + d.eventCost + d.educationCost).toLocaleString()}万円</p>
      <p className={d.cashFlow >= 0 ? "text-emerald-600" : "text-rose-600"}>
        年間収支: {d.cashFlow >= 0 ? "+" : ""}
        {d.cashFlow.toLocaleString()}万円
      </p>
      {d.milestones.length > 0 && (
        <p className="text-blue-600 font-bold">
          {d.milestones.join("、")}
        </p>
      )}
    </div>
  );
}

export function NetWorthChart({ projections, retirementAge }: Props) {
  // Split data for positive/negative areas
  const data = projections.map((p) => ({
    ...p,
    positive: p.netWorth >= 0 ? p.netWorth : 0,
    negative: p.netWorth < 0 ? p.netWorth : 0,
  }));

  return (
    <div className="w-full">
      <h3 className="text-sm font-bold mb-2">資産推移</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => `${v}歳`}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => `${v.toLocaleString()}`}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={retirementAge}
            stroke="#6366f1"
            strokeDasharray="4 4"
            label={{ value: "退職", position: "top", fontSize: 10 }}
          />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <Area
            type="monotone"
            dataKey="positive"
            stroke="#059669"
            fill="#059669"
            fillOpacity={0.2}
            name="資産（プラス）"
          />
          <Area
            type="monotone"
            dataKey="negative"
            stroke="#e11d48"
            fill="#e11d48"
            fillOpacity={0.2}
            name="資産（マイナス）"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
