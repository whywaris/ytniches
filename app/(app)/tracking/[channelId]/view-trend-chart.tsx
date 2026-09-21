"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

// Recharts uses hooks/context internally and cannot render inside a Server
// Component -- isolated into its own client island, same as
// niches/channels/[channelId]/view-trend-chart.tsx (duplicated rather than
// imported cross-feature: zero business logic, a pure recharts wrapper).
export function ViewTrendChart({ viewTrend }: { viewTrend: number[] }) {
  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={viewTrend.map((value) => ({ value }))}>
          <Line
            type="monotone"
            dataKey="value"
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
