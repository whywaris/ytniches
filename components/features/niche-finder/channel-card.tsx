"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";

import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import type { NicheChannelResult } from "@/components/features/niche-finder/types";

// UI-UX-Flow.md §5.2 grid card. Presentational only — no network calls;
// onSave/onOpen are callbacks, the parent page owns the actual Server
// Action calls and any resulting toast/state update.
export interface ChannelCardProps {
  channel: NicheChannelResult;
  saved?: boolean;
  onSave?: (channelId: string) => void;
  onOpen?: (channelId: string) => void;
  className?: string;
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

function ChannelCard({ channel, saved = false, onSave, onOpen, className }: ChannelCardProps) {
  const initials = channel.name.slice(0, 2).toUpperCase();

  return (
    <Card
      variant="interactive"
      className={cn("relative", className)}
      onClick={() => onOpen?.(channel.id)}
    >
      <button
        type="button"
        aria-label={saved ? "Remove from tracking" : "Save to tracking"}
        aria-pressed={saved}
        onClick={(event) => {
          event.stopPropagation();
          onSave?.(channel.id);
        }}
        className="absolute top-3 right-3 text-text-tertiary hover:text-accent-text"
      >
        {saved ? (
          <BookmarkCheck className="size-4 text-accent-text" aria-hidden="true" />
        ) : (
          <Bookmark className="size-4" aria-hidden="true" />
        )}
      </button>

      <div className="flex items-center gap-3 pr-6">
        <Avatar size="lg" src={channel.avatarUrl ?? undefined} fallback={initials} />
        <h4 className="truncate text-h4 text-text-primary">{channel.name}</h4>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-sm text-text-secondary">
        <span>{formatCount(channel.subscriberCount)} subs</span>
        <span>{formatCount(channel.videoCount)} videos</span>
        <span>{formatCount(channel.avgViewsLast30Days)} avg views</span>
      </div>

      {/* A single point can't draw a trend — omit rather than render a flat
          or misleading line. Cold-cache channels (viewTrend: []) also land
          here. */}
      {channel.viewTrend.length > 1 ? (
        <div className="mt-3 h-10 w-full" data-testid="channel-card-sparkline">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={channel.viewTrend.map((value) => ({ value }))}>
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
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {channel.language ? <Tag tone="neutral">{channel.language.toUpperCase()}</Tag> : null}
        {channel.country ? <Tag tone="neutral">{channel.country}</Tag> : null}
        {channel.isMonetized === true ? <Tag tone="success">Monetized</Tag> : null}
      </div>
    </Card>
  );
}

export { ChannelCard };
