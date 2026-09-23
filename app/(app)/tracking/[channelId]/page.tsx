import { cache } from "react";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ArrowLeft, ExternalLink } from "lucide-react";

import { getRequestContext } from "@/lib/context";
import { getChannelDetail, listVideosForChannel } from "@/lib/services/channels";
import { getChannelActivity, getTrackedChannel } from "@/lib/services/tracking";
import { listChannelOutliers } from "@/lib/services/outliers";
import { Avatar } from "@/components/ui/avatar";
import { Tag } from "@/components/ui/tag";
import { ChannelTabs } from "@/app/(app)/tracking/[channelId]/channel-tabs";
import { RemoveButton } from "@/app/(app)/tracking/[channelId]/remove-button";

import type { Metadata } from "next";

// React's request-scoped cache: generateMetadata and the page component
// both need this channel's detail, and without memoizing, Next.js runs
// both independently (same reasoning as niches/channels/[channelId]/page.tsx).
const getCachedChannelDetail = cache(async (channelId: string) => {
  const ctx = await getRequestContext();
  return getChannelDetail(ctx, channelId);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ channelId: string }>;
}): Promise<Metadata> {
  const { channelId } = await params;
  const result = await getCachedChannelDetail(channelId);
  return {
    title: result.ok ? `${result.value.name} — Tracking — YTNiches` : "Tracking — YTNiches",
  };
}

// UI-UX-Flow.md §6.2. Deep-linkable (Application-Flow.md §2.3), but only
// meaningful for a channel the current user actually tracks -- the header's
// "tracked since" chip and remove button both assume that -- so an
// untracked channel ID redirects back to the overview rather than
// rendering a half-broken page.
export default async function TrackingChannelPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  const ctx = await getRequestContext();

  const trackedChannel = await getTrackedChannel(ctx, channelId);
  if (!trackedChannel) {
    redirect("/tracking");
  }

  const [channelResult, activityResult, videos, outliersResult] = await Promise.all([
    getCachedChannelDetail(channelId),
    getChannelActivity(ctx, channelId, { limit: 30 }),
    listVideosForChannel(channelId),
    listChannelOutliers(ctx, channelId, { limit: 30 }),
  ]);

  if (!channelResult.ok) {
    notFound();
  }
  const channel = channelResult.value;
  const events = activityResult.ok ? activityResult.value.events : [];
  const outliers = outliersResult.ok ? outliersResult.value.items : [];

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 lg:px-10">
      <Link
        href="/tracking"
        className="mb-4 inline-flex items-center gap-1.5 text-body-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to tracking
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar
            size="xl"
            src={channel.avatarUrl ?? undefined}
            fallback={channel.name.slice(0, 2).toUpperCase()}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-h1 text-text-primary">{channel.name}</h1>
              <a
                href={channel.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${channel.name} on YouTube`}
                className="text-text-tertiary hover:text-text-primary"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Tag tone="channels">
                Tracked since {new Date(trackedChannel.trackedSince).toLocaleDateString()}
              </Tag>
            </div>
          </div>
        </div>

        <RemoveButton channelId={channelId} channelName={channel.name} />
      </div>

      <div className="mt-6">
        <ChannelTabs
          events={events}
          videos={videos}
          outliers={outliers}
          metrics={{
            avgViewsLast30Days: channel.avgViewsLast30Days,
            avgViewsLifetime: channel.avgViewsLifetime,
            uploadFrequencyPerWeek: channel.uploadFrequencyPerWeek,
            viewTrend: channel.viewTrend,
          }}
        />
      </div>
    </div>
  );
}
