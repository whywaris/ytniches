import { Bell, Flame, RefreshCw, TrendingUp, Video, type LucideIcon } from "lucide-react";

import { formatRelativeTime } from "@/lib/format-relative-time";
import { Card } from "@/components/ui/card";
import type { TrackedEvent } from "@/lib/services/tracking";

// Per-channel Activity tab: tracked_events, not notifications -- no per-user
// read/dismiss state and no pre-composed title (Backend-Schema.md §4.2's
// payload is raw event data), so this can't reuse ActivityFeedItem as-is.
// We're already on this channel's page, so "Go to channel"/"Dismiss" don't
// apply here either.
const EVENT_META: Record<string, { icon: LucideIcon; label: string }> = {
  new_video: { icon: Video, label: "New video" },
  view_spike: { icon: TrendingUp, label: "View spike" },
  cadence_change: { icon: RefreshCw, label: "Upload cadence changed" },
  outlier_detected: { icon: Flame, label: "Outlier" },
};

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function describeTrackedEvent(event: TrackedEvent): string | null {
  const payload = event.payload;
  switch (event.eventType) {
    case "new_video":
      return typeof payload.title === "string" ? payload.title : null;
    case "view_spike":
      return typeof payload.title === "string" && typeof payload.crossedThreshold === "number"
        ? `${payload.title} crossed ${formatCount(payload.crossedThreshold)} views`
        : null;
    case "cadence_change":
      return typeof payload.previousPerWeek === "number" &&
        typeof payload.currentPerWeek === "number"
        ? `Was ${payload.previousPerWeek.toFixed(1)}/week, now ${payload.currentPerWeek.toFixed(1)}/week`
        : null;
    case "outlier_detected":
      return typeof payload.title === "string" && typeof payload.viewCount === "number"
        ? `${payload.title} — ${formatCount(payload.viewCount)} views`
        : null;
    default:
      return null;
  }
}

export function ChannelEventItem({ event }: { event: TrackedEvent }) {
  const meta = EVENT_META[event.eventType] ?? { icon: Bell, label: "Activity" };
  const Icon = meta.icon;
  const description = describeTrackedEvent(event);

  return (
    <Card variant="base" padding="md" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-body-sm text-text-secondary">
          <Icon className="size-3.5" aria-hidden="true" />
          <span>{meta.label}</span>
        </div>
        <span className="shrink-0 text-caption text-text-tertiary">
          {formatRelativeTime(event.detectedAt)}
        </span>
      </div>
      {description ? <p className="text-body text-text-primary">{description}</p> : null}
    </Card>
  );
}
