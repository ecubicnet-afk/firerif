"use client";

import {
  PieChart,
  Pie,
  Cell,
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
      <p>{d.value}件</p>
    </div>
  );
}

export function QuestionStatusChart({ data }: Props) {
  const filteredData = data.filter((d) => d.value > 0);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className="w-full">
        <h3 className="text-sm font-bold mb-2">Q&A状況</h3>
        <p className="text-sm text-muted-foreground py-4 text-center">質問なし</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-sm font-bold mb-2">Q&A状況（全{total}件）</h3>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={2}
              dataKey="value"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-1 text-xs">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span>{d.name}: {d.value}件</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
