"use client";

import * as React from "react";

import { useToast } from "@/components/ui/toast-provider";
import { NicheCard } from "@/components/features/niche-finder/niche-card";
import { trackNicheAction } from "@/app/(app)/niches/actions";
import type { NicheFeedItem } from "@/lib/services/niche-feed";

// Wires NicheCard's Track to the server action (the card stays
// presentational, like ChannelCard in the Search tab).
function NicheGrid({ niches }: { niches: NicheFeedItem[] }) {
  const { showToast } = useToast();
  const [pendingSlug, setPendingSlug] = React.useState<string | null>(null);

  async function track(slug: string) {
    setPendingSlug(slug);
    const result = await trackNicheAction(slug);
    setPendingSlug(null);
    if (!result.ok) {
      showToast({ title: "Couldn't track this niche.", variant: "error" });
    } else if (result.value.limitReached) {
      showToast({
        title:
          result.value.tracked > 0
            ? `Tracked ${result.value.tracked} channels, then hit your plan's channel limit.`
            : "You've reached your plan's tracked-channel limit.",
        variant: "warning",
      });
    } else {
      showToast({ title: `Tracking ${result.value.tracked} top channels.`, variant: "success" });
    }
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {niches.map((niche) => (
        <li key={niche.id} className="flex">
          <NicheCard
            niche={niche}
            onTrack={track}
            tracking={pendingSlug === niche.slug}
            className="w-full"
          />
        </li>
      ))}
    </ul>
  );
}

export { NicheGrid };
