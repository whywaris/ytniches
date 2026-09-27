import * as React from "react";

import Image from "next/image";
import Link from "next/link";

import { Compass, Radar, Sparkles, Users } from "lucide-react";

import { buildFeedUrl } from "@/lib/discovery/feed-url";
import { LANGUAGE_OPTIONS } from "@/lib/discovery/feed-filters";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { formatCount, formatMultiple } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { Tooltip } from "@/components/ui/tooltip";
import type { FeedChannel } from "@/lib/services/niche-feed";

// D-077: the full-width channel row. Every number and chip comes from our
// own data (lib/services/niche-feed.ts, lib/discovery/insights.ts); chips
// explain their rule in a tooltip; no revenue or profitability claims.

export interface DiscoveryChannelCardProps {
  channel: FeedChannel;
  onTrack?: (channelId: string) => void;
  tracked?: boolean;
  tracking?: boolean;
  className?: string;
}

const CONTENT_TYPE_LABEL = { long: "Long-form", shorts: "Shorts", mixed: "Mixed" } as const;
const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function labelFor(options: { value: string; label: string }[], value: string | null): string {
  if (!value) return "—";
  return options.find((option) => option.value === value)?.label ?? value.toUpperCase();
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-caption text-text-tertiary">{label}</dt>
      <dd className="truncate text-body font-semibold text-text-primary tabular-nums">{value}</dd>
    </div>
  );
}

function DiscoveryChannelCard({
  channel,
  onTrack,
  tracked = false,
  tracking = false,
  className,
}: DiscoveryChannelCardProps) {
  const primary = channel.niches.find((niche) => niche.isPrimary) ?? channel.niches[0];
  const topVideo = channel.topVideos[0];
  const views30dLabel =
    channel.views30d.kind === "true" ? "Views (30 days)" : "Views on uploads from the last 30 days";

  return (
    <Card className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-start gap-3">
        <Avatar
          size="lg"
          src={channel.avatarUrl ?? undefined}
          fallback={channel.name.slice(0, 2).toUpperCase()}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-h4 font-semibold text-text-primary">
            <Link href={`/niches/channels/${channel.id}`} className="hover:underline">
              {channel.name}
            </Link>
          </h3>
          {channel.niches.length > 0 ? (
            <ul aria-label="Niches" className="mt-1 flex flex-wrap gap-1.5">
              {channel.niches.map((niche) => (
                <li key={niche.slug}>
                  <Link href={`/niches/${niche.slug}`}>
                    <Tag tone="niches">{niche.name}</Tag>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {channel.insights.length > 0 ? (
          <ul aria-label="Insights" className="flex flex-wrap gap-1.5">
            {channel.insights.map((insight) => (
              <li key={insight.id}>
                <Tooltip content={insight.hint}>
                  <button type="button" className="rounded-sm">
                    <Tag tone="info">{insight.label}</Tag>
                  </button>
                </Tooltip>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 lg:grid-cols-8">
        <Stat label="Subscribers" value={formatCount(channel.subscriberCount)} />
        <Stat
          label={views30dLabel}
          value={channel.views30d.value === null ? "—" : formatCount(channel.views30d.value)}
        />
        <Stat label="Active since" value={MONTH_YEAR.format(new Date(channel.activeSince))} />
        <Stat label="Total videos" value={formatCount(channel.videoCount)} />
        <Stat
          label="Typical views"
          value={channel.medianViewsRecent === null ? "—" : formatCount(channel.medianViewsRecent)}
        />
        <Stat label="Language" value={labelFor(LANGUAGE_OPTIONS, channel.language)} />
        <Stat
          label="Content type"
          value={channel.contentType ? CONTENT_TYPE_LABEL[channel.contentType] : "—"}
        />
        <Stat
          label="Spotted"
          value={channel.discoveredAt ? formatRelativeTime(channel.discoveredAt) : "—"}
        />
      </dl>

      {channel.topVideos.length > 0 ? (
        <div>
          <h4 className="mb-2 text-caption font-medium text-text-secondary">Top videos</h4>
          <ul className="grid gap-3 sm:grid-cols-3">
            {channel.topVideos.map((video) => (
              <li key={video.youtubeVideoId}>
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                >
                  <span className="relative block aspect-video overflow-hidden rounded-xs bg-bg-surface-2">
                    <Image
                      src={video.thumbnailUrl}
                      alt=""
                      width={320}
                      height={180}
                      loading="lazy"
                      unoptimized
                      className="size-full object-cover"
                    />
                    {video.isOutlier && video.outlierMultiple !== null ? (
                      <span className="absolute top-1.5 left-1.5 rounded-xs bg-accent px-1.5 py-0.5 text-caption font-semibold text-text-inverse">
                        Outlier {formatMultiple(video.outlierMultiple)}
                      </span>
                    ) : null}
                  </span>
                  <p className="mt-1 line-clamp-2 text-body-sm text-text-primary group-hover:underline">
                    {video.title}
                  </p>
                  <p className="text-caption text-text-tertiary">
                    {formatCount(video.viewCount)} views · {formatRelativeTime(video.publishedAt)}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-border-subtle pt-3">
        {channel.viewsToSubs !== null ? (
          <Tooltip content="Typical views per video compared with the subscriber count.">
            <button type="button" className="rounded-sm">
              <Tag tone="neutral">{formatMultiple(channel.viewsToSubs)} views vs subs</Tag>
            </button>
          </Tooltip>
        ) : null}
        <div className="flex-1" />
        {primary ? (
          <>
            <Button asChild size="sm" variant="ghost">
              <Link href={buildFeedUrl("channels", { niche: primary.slug })}>
                <Users />
                Similar channels
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/niches/${primary.slug}`}>
                <Compass />
                Analyze niche
              </Link>
            </Button>
          </>
        ) : null}
        {topVideo ? (
          <Button asChild size="sm" variant="secondary">
            <Link href={`/prompts?channelId=${channel.id}&videoId=${topVideo.videoId}`}>
              <Sparkles />
              Generate prompts
            </Link>
          </Button>
        ) : null}
        {onTrack ? (
          <Button
            size="sm"
            variant={tracked ? "secondary" : "primary"}
            loading={tracking}
            disabled={tracked}
            onClick={() => onTrack(channel.id)}
          >
            <Radar />
            {tracked ? "Tracking" : "Track"}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

export { DiscoveryChannelCard };
