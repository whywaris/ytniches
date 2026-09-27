"use client";

import * as React from "react";

import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { NicheChannelResult } from "@/components/features/niche-finder/types";

// UI-UX-Flow.md §5.2 comparison view — 2-3 channels side by side. "Top
// video" from the spec is dropped: ChannelSearchResult only carries
// aggregate numbers per channel, no per-video identity to name a specific
// video. Rows here are limited to what's actually available.
export interface ComparisonViewProps {
  channels: NicheChannelResult[];
  onRemove?: (channelId: string) => void;
  className?: string;
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

interface ComparisonRow {
  label: string;
  render: (channel: NicheChannelResult) => React.ReactNode;
  /** Higher wins. Omitted for rows with no meaningful "better" direction. */
  winnerValue?: (channel: NicheChannelResult) => number;
}

const ROWS: ComparisonRow[] = [
  {
    label: "Subscribers",
    render: (channel) => formatCount(channel.subscriberCount),
    winnerValue: (channel) => channel.subscriberCount,
  },
  {
    label: "Avg views (30d)",
    render: (channel) => formatCount(channel.avgViewsLast30Days),
    winnerValue: (channel) => channel.avgViewsLast30Days,
  },
  {
    label: "Upload frequency",
    render: (channel) => `${channel.uploadFrequencyPerWeek.toFixed(1)}/wk`,
    winnerValue: (channel) => channel.uploadFrequencyPerWeek,
  },
  {
    label: "Channel age",
    render: (channel) => new Date(channel.youtubeCreatedAt).toLocaleDateString(),
  },
];

function findWinnerId(row: ComparisonRow, channels: NicheChannelResult[]): string | null {
  if (!row.winnerValue) return null;
  const getValue = row.winnerValue;
  return channels.reduce((best, current) => (getValue(current) > getValue(best) ? current : best))
    .id;
}

function ComparisonView({ channels, onRemove, className }: ComparisonViewProps) {
  // Runtime guard, not a type constraint — TypeScript can't enforce array
  // length. Silent no-render is better than a broken layout.
  if (channels.length < 2 || channels.length > 3) {
    return null;
  }

  return (
    <div
      className={cn("grid gap-4", channels.length === 3 ? "grid-cols-3" : "grid-cols-2", className)}
    >
      {channels.map((channel) => (
        <Card key={channel.id} variant="base" padding="md" className="relative flex flex-col gap-2">
          {onRemove ? (
            <button
              type="button"
              aria-label={`Remove ${channel.name} from comparison`}
              onClick={() => onRemove(channel.id)}
              className="absolute top-3 right-3 text-text-tertiary hover:text-text-primary"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}

          <div className="flex items-center gap-2 pr-6">
            <Avatar
              size="md"
              src={channel.avatarUrl ?? undefined}
              fallback={channel.name.slice(0, 2).toUpperCase()}
            />
            <h4 className="truncate text-h4 text-text-primary">{channel.name}</h4>
          </div>

          {ROWS.map((row) => {
            const isWinner = findWinnerId(row, channels) === channel.id;
            return (
              <div
                key={row.label}
                className={cn(
                  "flex items-center justify-between rounded-sm px-2 py-1.5 text-body-sm",
                  isWinner && "border border-accent",
                )}
              >
                <span className="text-text-tertiary">{row.label}</span>
                <span
                  className={cn("font-medium", isWinner ? "text-accent-text" : "text-text-primary")}
                >
                  {row.render(channel)}
                </span>
              </div>
            );
          })}
        </Card>
      ))}
    </div>
  );
}

export { ComparisonView };
