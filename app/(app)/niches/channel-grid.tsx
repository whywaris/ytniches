"use client";

import * as React from "react";

import { useToast } from "@/components/ui/toast-provider";
import { DiscoveryChannelCard } from "@/components/features/niche-finder/discovery-channel-card";
import { saveChannelAction } from "@/app/(app)/niches/actions";
import type { FeedChannel } from "@/lib/services/niche-feed";

function ChannelGrid({ channels }: { channels: FeedChannel[] }) {
  const { showToast } = useToast();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [trackedIds, setTrackedIds] = React.useState<Set<string>>(new Set());

  async function track(channelId: string) {
    setPendingId(channelId);
    const result = await saveChannelAction(channelId);
    setPendingId(null);
    if (result.ok) {
      setTrackedIds((current) => new Set(current).add(channelId));
      showToast({ title: "Channel added to tracking.", variant: "success" });
    } else {
      showToast({
        title: `You've reached your plan's limit of ${result.error.limit} tracked channels.`,
        variant: "warning",
      });
    }
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {channels.map((channel) => (
        <li key={channel.id} className="flex">
          <DiscoveryChannelCard
            channel={channel}
            onTrack={track}
            tracked={trackedIds.has(channel.id)}
            tracking={pendingId === channel.id}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}

export { ChannelGrid };
