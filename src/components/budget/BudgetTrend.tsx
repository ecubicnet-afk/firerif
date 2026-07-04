"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendPoint {
  year: number;
  month: number;
  label: string;
  fixedTotal: number;
  variableTotal: number;
  expenseTotal: number;
  cardTotal: number;
  bankTotal: number;
  cashTotal: number;
}

function yen(n: number) {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export function BudgetTrend({ trend }: { trend: TrendPoint[] }) {
  const hasData = trend.some((t) => t.expenseTotal > 0);

  if (!hasData) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        まだ推移データがありません。月末の入力を重ねると、ここに支出の移り変わりがグラフで出ます。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">直近{trend.length}ヶ月の支出推移</p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trend} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={42}
              tickFormatter={(v: number) => (v >= 10000 ? `${Math.round(v / 10000)}万` : String(v))}
            />
            <Tooltip
              formatter={(v, name) => [yen(Number(v)), name === "fixedTotal" ? "固定費" : "変動費"]}
              labelFormatter={(l) => l}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Legend formatter={(v) => (v === "fixedTotal" ? "固定費" : "変動費")} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="fixedTotal" stackId="a" fill="#2563eb" />
            <Bar dataKey="variableTotal" stackId="a" fill="#ea580c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        青＝固定費 / オレンジ＝変動費。固定費の棒が月を追うごとに低くなっていれば、節約が「自動で」効いているサインです。
      </p>
    </div>
  );
}
