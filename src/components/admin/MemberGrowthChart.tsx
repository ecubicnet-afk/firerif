"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  month: string;
  total: number;
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
      <p className="font-bold">{d.month}</p>
      <p className="text-blue-600">累計会員数: {d.total}名</p>
    </div>
  );
}

export function MemberGrowthChart({ data }: Props) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-bold mb-2">会員数推移</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="month" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} width={40} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.15}
            name="累計会員数"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
