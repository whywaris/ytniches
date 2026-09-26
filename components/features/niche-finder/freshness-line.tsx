import * as React from "react";

import { formatRelativeTime } from "@/lib/format-relative-time";

// Niche-Discovery-Engine.md §9.1 / §2 "honest data": a freshness timestamp
// is always visible above the feeds.
export interface FreshnessLineProps {
  updatedAt: string | null;
  newChannelsThisWeek: number;
  now?: number;
}

function FreshnessLine({ updatedAt, newChannelsThisWeek, now }: FreshnessLineProps) {
  return (
    <p className="text-caption text-text-tertiary">
      {updatedAt ? `Updated ${formatRelativeTime(updatedAt, now)}` : "First update pending"}
      {" · "}
      {newChannelsThisWeek.toLocaleString()} new channels this week
    </p>
  );
}

export { FreshnessLine };
