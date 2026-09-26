"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { NicheHistoryPoint } from "@/lib/services/niche-feed";

// Recharts can't render in a Server Component (see view-trend-chart.tsx),
// so the 90-day score line is its own client island.
export function ScoreTrendChart({ history }: { history: NicheHistoryPoint[] }) {
  return (
    <div className="h-48 w-full" role="img" aria-label="Opportunity score over the last 90 days">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
            tickFormatter={(value: string) => value.slice(5)}
            minTickGap={24}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--color-text-tertiary)", fontSize: 11 }}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-bg-surface-1)",
              border: "1px solid var(--color-border-subtle)",
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            name="Score"
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
