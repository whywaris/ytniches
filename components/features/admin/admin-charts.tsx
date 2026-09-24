"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Recharts needs client context -- both admin charts live in this one
// island. Colors come from design tokens, never inline hex.
const AXIS = { stroke: "var(--color-text-secondary)", fontSize: 12 };
const TOOLTIP = {
  contentStyle: {
    background: "var(--color-bg-surface-2)",
    border: "1px solid var(--color-border-default)",
    borderRadius: 6,
  },
  labelStyle: { color: "var(--color-text-primary)" },
};

export function MrrChart({ series }: { series: { month: string; mrrCents: number }[] }) {
  const data = series.map((point) => ({ month: point.month, mrr: point.mrrCents / 100 }));
  return (
    <div className="h-64 w-full" role="img" aria-label="MRR by month for the last 12 months">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
          <XAxis dataKey="month" tick={AXIS} stroke="var(--color-border-default)" />
          <YAxis
            tick={AXIS}
            stroke="var(--color-border-default)"
            tickFormatter={(v: number) => `$${v}`}
          />
          <Tooltip {...TOOLTIP} formatter={(value) => [`$${Number(value).toFixed(2)}`, "MRR"]} />
          <Line
            type="monotone"
            dataKey="mrr"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QuotaChart({
  history,
  softLimit,
  limit,
}: {
  history: { date: string; used: number }[];
  softLimit: number;
  limit: number;
}) {
  return (
    <div
      className="h-64 w-full"
      role="img"
      aria-label="YouTube API units used per day, last 7 days"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={history} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={AXIS}
            stroke="var(--color-border-default)"
            tickFormatter={(d: string) => d.slice(5)}
          />
          <YAxis
            tick={AXIS}
            stroke="var(--color-border-default)"
            domain={[0, Math.max(limit, ...history.map((d) => d.used))]}
          />
          <Tooltip {...TOOLTIP} formatter={(value) => [Number(value).toLocaleString(), "Units"]} />
          <ReferenceLine
            y={softLimit}
            stroke="var(--color-warning)"
            strokeDasharray="4 4"
            label={{
              value: "Soft limit",
              fill: "var(--color-warning)",
              fontSize: 11,
              position: "insideTopLeft",
            }}
          />
          <ReferenceLine
            y={limit}
            stroke="var(--color-error)"
            strokeDasharray="4 4"
            label={{
              value: "Hard limit",
              fill: "var(--color-error)",
              fontSize: 11,
              position: "insideTopLeft",
            }}
          />
          <Bar dataKey="used" fill="var(--color-accent)" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
