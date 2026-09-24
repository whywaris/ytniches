"use client";

import * as React from "react";

import Link from "next/link";

import { Flame } from "lucide-react";

import { MetricCard } from "@/components/features/dashboard/metric-card";
import { readRecentRoutes, type RecentRoute } from "@/lib/client/recent-routes";
import { recordVisitAndGetStreak } from "@/lib/client/streak";

// UI-UX-Flow.md §4.5's "Days streak (visits)" card and "Continue where you
// left off" section -- both localStorage-only (D-049), unreachable from the
// otherwise server-rendered dashboard page. Kept in one file: two small
// mount-time reads, not worth two separate client boundaries.
function StreakMetricCard() {
  const [streak, setStreak] = React.useState<number | null>(null);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from an external system (localStorage) post-mount, same pattern as components/ui/sidebar.tsx
    setStreak(recordVisitAndGetStreak());
  }, []);

  return <MetricCard label="Days streak" value={streak ?? "—"} icon={Flame} />;
}

function ContinueWhereLeftOff() {
  const [routes, setRoutes] = React.useState<RecentRoute[]>([]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from an external system (localStorage) post-mount, same pattern as components/ui/sidebar.tsx
    setRoutes(readRecentRoutes().slice(0, 3));
  }, []);

  if (routes.length === 0) return null;

  return (
    <section>
      <h2 className="mb-2 text-body-sm font-semibold text-text-secondary">
        Continue where you left off
      </h2>
      <div className="flex flex-wrap gap-2">
        {routes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className="rounded-sm border border-border-subtle px-3 py-1.5 text-body-sm text-text-primary hover:bg-bg-hover"
          >
            {route.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

export { StreakMetricCard, ContinueWhereLeftOff };
