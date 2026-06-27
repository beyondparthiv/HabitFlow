"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthStat } from "@/lib/utils/stats";

type Row = {
  name: string;
  rate: number;
  label: string;
  done: number;
  possible: number;
  key: string;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: Row }[];
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card px-3 py-2 text-xs shadow-sm">
      <div className="font-medium">{d.label}</div>
      <div className="text-muted-foreground">
        {d.rate}% · {d.done}/{d.possible} days
      </div>
    </div>
  );
}

export function HistoryChart({
  data,
  bestKey,
}: {
  data: MonthStat[];
  bestKey?: string;
}) {
  const rows: Row[] = data.map((d) => ({
    name: d.short,
    rate: Math.round(d.rate * 100),
    label: d.label,
    done: d.done,
    possible: d.possible,
    key: `${d.year}-${d.monthIndex}`,
  }));

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tickFormatter={(v) => `${v}%`}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            width={44}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            content={<CustomTooltip />}
          />
          <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={64}>
            {rows.map((d) => (
              <Cell
                key={d.key}
                fill={d.key === bestKey ? "var(--streak)" : "var(--primary)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
