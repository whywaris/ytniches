"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchInput } from "@/components/ui/search-input";
import type { TrackedChannelSummary } from "@/components/features/tracking/types";

// UI-UX-Flow.md §6.1's right-side panel. Local text filter over the
// already-fetched channel list — no server round trip for filtering a list
// this small (tier caps top out at 100 channels, Backend-Schema.md §2.3).
export interface TrackedChannelsPanelProps {
  channels: TrackedChannelSummary[];
  activeChannelId?: string | null;
  onSelectChannel?: (channelId: string | null) => void;
  className?: string;
}

function TrackedChannelsPanel({
  channels,
  activeChannelId = null,
  onSelectChannel,
  className,
}: TrackedChannelsPanelProps) {
  const [query, setQuery] = React.useState("");

  const filtered = query.trim()
    ? channels.filter((channel) => channel.name.toLowerCase().includes(query.trim().toLowerCase()))
    : channels;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <SearchInput
        aria-label="Filter tracked channels"
        placeholder="Filter tracked channels"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onClear={() => setQuery("")}
      />

      {channels.length === 0 ? (
        <EmptyState message="No tracked channels yet" />
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-body-sm text-text-tertiary">
          No channels match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {filtered.map((channel) => {
            const isActive = channel.id === activeChannelId;
            return (
              <li key={channel.id}>
                <button
                  type="button"
                  onClick={() => onSelectChannel?.(isActive ? null : channel.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm border-l-2 border-l-transparent px-2 py-1.5 text-left",
                    "transition-colors duration-fast ease-out hover:bg-bg-hover",
                    isActive && "border-l-accent bg-accent-subtle",
                  )}
                >
                  <Avatar
                    size="sm"
                    src={channel.avatarUrl ?? undefined}
                    fallback={channel.name.slice(0, 2).toUpperCase()}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-body-sm font-medium text-text-primary">
                      {channel.name}
                    </span>
                    <span className="block truncate text-caption text-text-tertiary">
                      {channel.lastActivityAt
                        ? formatRelativeTime(channel.lastActivityAt)
                        : "No activity yet"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export { TrackedChannelsPanel };
