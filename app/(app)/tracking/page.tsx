import { getRequestContext } from "@/lib/context";
import { getActivityFeed, listTrackedChannelsSummary } from "@/lib/services/tracking";
import { joinNotificationChannels } from "@/app/(app)/tracking/notification-refs";
import { toActivityFeedState } from "@/app/(app)/tracking/activity-feed-state";
import { parseTimeRange, rangeToSince } from "@/app/(app)/tracking/time-range";
import { TrackingClient } from "@/app/(app)/tracking/tracking-client";
import type { FeedFilter } from "@/app/(app)/tracking/tracking-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tracking — YTNiches",
};

const FEED_PAGE_SIZE = 20;

function parseFilter(raw: string | undefined): FeedFilter {
  return raw === "new_video" || raw === "view_spike" || raw === "cadence_change" ? raw : "all";
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

// UI-UX-Flow.md §6.1. A Server Component so the first paint of an
// already-shared/bookmarked filter+range combination is server-rendered
// straight from the URL (Application-Flow.md §2.5) — the interactive
// layer (filters, load more, add-channel modal) lives in
// tracking-client.tsx.
export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filter = parseFilter(getParam(params, "filter"));
  const range = parseTimeRange(getParam(params, "range"));

  const ctx = await getRequestContext();
  const [feedResult, trackedChannels] = await Promise.all([
    getActivityFeed(ctx, { limit: FEED_PAGE_SIZE, filter, since: rangeToSince(range) }),
    listTrackedChannelsSummary(ctx),
  ]);

  const feedState = toActivityFeedState(
    feedResult.ok
      ? {
          ok: true,
          value: {
            notifications: await joinNotificationChannels(feedResult.value.notifications),
            nextCursor: feedResult.value.nextCursor,
          },
        }
      : feedResult,
  );

  return (
    <TrackingClient
      initialFilter={filter}
      initialRange={range}
      initialState={feedState}
      trackedChannels={trackedChannels}
    />
  );
}
