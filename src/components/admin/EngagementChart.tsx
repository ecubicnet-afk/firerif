"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  feature: string;
  users: number;
}

interface Props {
  data: DataPoint[];
  totalUsers: number;
}

function CustomTooltip({
  active,
  payload,
  totalUsers,
}: {
  active?: boolean;
  payload?: Array<{ payload: DataPoint }>;
  totalUsers?: number;
}) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const pct = totalUsers ? Math.round((d.users / totalUsers) * 100) : 0;
  return (
    <div className="rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur border shadow-lg p-3 text-xs space-y-1">
      <p className="font-bold">{d.feature}</p>
      <p className="text-blue-600">{d.users}名 ({pct}%)</p>
    </div>
  );
}

export function EngagementChart({ data, totalUsers }: Props) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-bold mb-2">機能別利用者数</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="feature"
            tick={{ fontSize: 11 }}
            width={100}
          />
          <Tooltip content={<CustomTooltip totalUsers={totalUsers} />} />
          <Bar
            dataKey="users"
            fill="#2563eb"
            radius={[0, 4, 4, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
