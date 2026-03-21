"use client";

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: DataPoint[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DataPoint }>;
}) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur border shadow-lg p-3 text-xs space-y-1">
      <p className="font-bold">{d.name}</p>
      <p>{d.value}名</p>
    </div>
  );
}

export function SubscriptionPieChart({ data }: Props) {
  const filteredData = data.filter((d) => d.value > 0);

  if (filteredData.length === 0) {
    return (
      <div className="w-full">
        <h3 className="text-sm font-bold mb-2">サブスクリプション状態</h3>
        <p className="text-sm text-muted-foreground py-8 text-center">データなし</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-bold mb-2">サブスクリプション状態</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
