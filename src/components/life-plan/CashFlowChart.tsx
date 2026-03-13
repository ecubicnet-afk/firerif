"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Array<any>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as YearlyProjection | undefined;
  if (!item) return null;
  return (
    <div className="rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur border shadow-lg p-3 text-xs space-y-1">
      <p className="font-bold">
        {item.age}歳（{item.year}年）
      </p>
      <p className="text-emerald-600">収入: {item.income.toLocaleString()}万円</p>
      <p className="text-blue-600">生活費: {item.expense.toLocaleString()}万円</p>
      <p className="text-amber-600">住居費: {item.housingCost.toLocaleString()}万円</p>
      {item.educationCost > 0 && (
        <p className="text-purple-600">教育費: {item.educationCost.toLocaleString()}万円</p>
      )}
      {item.eventCost > 0 && (
        <p className="text-pink-600">イベント: {item.eventCost.toLocaleString()}万円</p>
      )}
    </div>
  );
}

export function CashFlowChart({ projections, retirementAge }: Props) {
  // Sample every 5 years for readability (keep all milestones)
  const sampled = projections.filter(
    (p, i) => i % 5 === 0 || p.milestones.length > 0 || i === projections.length - 1
  );

  const data = sampled.map((p) => ({
    ...p,
    totalExpense: -(p.expense + p.housingCost + p.eventCost + p.educationCost),
  }));

  return (
    <div className="w-full">
      <h3 className="text-sm font-bold mb-2">収支バランス（5年ごと）</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          <Legend
            wrapperStyle={{ fontSize: 10 }}
            formatter={(value) => <span className="text-xs">{value}</span>}
          />
          <ReferenceLine y={0} stroke="#94a3b8" />
          <ReferenceLine
            x={retirementAge}
            stroke="#6366f1"
            strokeDasharray="4 4"
          />
          <Bar dataKey="income" name="収入" fill="#059669" radius={[2, 2, 0, 0]} />
          <Bar
            dataKey="totalExpense"
            name="支出"
            fill="#e11d48"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
