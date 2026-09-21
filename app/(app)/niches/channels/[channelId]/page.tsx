import { cache } from "react";

import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, ExternalLink } from "lucide-react";

import { getRequestContext } from "@/lib/context";
import { getChannelDetail } from "@/lib/services/channels";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { SaveButton } from "@/app/(app)/niches/channels/[channelId]/save-button";
import { ViewTrendChart } from "@/app/(app)/niches/channels/[channelId]/view-trend-chart";

import type { Metadata } from "next";

// React's request-scoped cache: generateMetadata and the page component
// both need this channel's detail, and without memoizing, Next.js runs
// both independently — doubling the video-aggregation query for every
// page load. cache() dedupes by argument identity for the lifetime of one
// request.
const getCachedChannelDetail = cache(async (channelId: string) => {
  const ctx = await getRequestContext();
  return getChannelDetail(ctx, channelId);
});

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ channelId: string }>;
}): Promise<Metadata> {
  const { channelId } = await params;
  const result = await getCachedChannelDetail(channelId);
  return { title: result.ok ? `${result.value.name} — YTNiches` : "Channel — YTNiches" };
}

// UI-UX-Flow.md §5.3. Trimmed from the full spec: no Videos/Trends/About
// tabs — that needs an actual video list and historical trend data this
// service doesn't return yet (only aggregates + viewTrend). The "recent
// video views" chart below reuses viewTrend (already fetched for the grid
// card's sparkline) rather than building a separate Trends data source.
export default async function ChannelDetailPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  const result = await getCachedChannelDetail(channelId);

  if (!result.ok) {
    notFound();
  }

  const channel = result.value;

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-6 lg:px-10">
      <Link
        href="/niches"
        className="mb-4 inline-flex items-center gap-1.5 text-body-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to results
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
            <p className="text-body-sm text-text-secondary">
              {formatCount(channel.subscriberCount)} subscribers · {formatCount(channel.videoCount)}{" "}
              videos · joined {new Date(channel.youtubeCreatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <SaveButton channelId={channel.id} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card padding="md">
          <p className="text-caption text-text-tertiary">Subscribers</p>
          <p className="text-h3 text-text-primary">{formatCount(channel.subscriberCount)}</p>
        </Card>
        <Card padding="md">
          <p className="text-caption text-text-tertiary">Avg views (30d)</p>
          <p className="text-h3 text-text-primary">{formatCount(channel.avgViewsLast30Days)}</p>
        </Card>
        <Card padding="md">
          <p className="text-caption text-text-tertiary">Upload frequency</p>
          <p className="text-h3 text-text-primary">
            {channel.uploadFrequencyPerWeek.toFixed(1)}/wk
          </p>
        </Card>
        <Card padding="md">
          <p className="text-caption text-text-tertiary">Est. monthly views</p>
          <p className="text-h3 text-text-primary">
            {formatCount(channel.avgViewsLast30Days * channel.uploadFrequencyPerWeek * 4.3)}
          </p>
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-1.5">
        {channel.language ? <Tag tone="neutral">{channel.language.toUpperCase()}</Tag> : null}
        {channel.country ? <Tag tone="neutral">{channel.country}</Tag> : null}
        {channel.isMonetized === true ? <Tag tone="success">Monetized</Tag> : null}
      </div>

      {channel.viewTrend.length > 1 ? (
        <Card padding="md" className="mt-6">
          <p className="mb-2 text-caption text-text-tertiary">Recent video views</p>
          <ViewTrendChart viewTrend={channel.viewTrend} />
        </Card>
      ) : null}

      {channel.description ? (
        <Card padding="md" className="mt-6">
          <p className="mb-2 text-caption text-text-tertiary">About</p>
          <p className="whitespace-pre-wrap text-body-sm text-text-secondary">
            {channel.description}
          </p>
        </Card>
      ) : null}
    </div>
  );
}
