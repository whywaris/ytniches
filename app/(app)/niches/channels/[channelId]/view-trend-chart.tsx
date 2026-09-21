"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

// Recharts uses hooks/context internally and cannot render inside a Server
// Component — this bit the channel detail page directly (crashed with
// "createContext is not a function", the RSC environment has no client
// React context). Isolated into its own client island, same pattern as
// components/features/niche-finder/channel-card.tsx's sparkline.
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
