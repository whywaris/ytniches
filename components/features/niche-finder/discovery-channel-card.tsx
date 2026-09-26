import * as React from "react";

import Image from "next/image";
import Link from "next/link";

import { formatRelativeTime } from "@/lib/format-relative-time";
import { formatCount, formatMultiple } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import type { FeedChannel } from "@/lib/services/niche-feed";

// Niche-Discovery-Engine.md §9.3: competitor baseline (four stat tiles +
// most popular videos) plus our niche badge and honest "est." labels.

export interface DiscoveryChannelCardProps {
  channel: FeedChannel;
  onTrack?: (channelId: string) => void;
  tracked?: boolean;
  tracking?: boolean;
  className?: string;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-bg-surface-2 px-2.5 py-2">
      <dt className="text-caption text-text-tertiary">{label}</dt>
      <dd className="text-body font-semibold text-text-primary tabular-nums">{value}</dd>
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
  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-3">
        <Avatar
          size="lg"
          src={channel.avatarUrl ?? undefined}
          fallback={channel.name.slice(0, 2).toUpperCase()}
        />
        <div className="min-w-0">
          <h3 className="truncate text-h4 font-semibold text-text-primary">
            <Link href={`/niches/channels/${channel.id}`} className="hover:underline">
              {channel.name}
            </Link>
          </h3>
          <p className="text-body-sm text-text-secondary">
            {formatCount(channel.subscriberCount)} subscribers
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {channel.niche ? (
          <Link href={`/niches/${channel.niche.slug}`}>
            <Tag tone="niches">{channel.niche.name}</Tag>
          </Link>
        ) : null}
        {channel.isFaceless ? <Tag tone="info">Faceless</Tag> : null}
        {channel.likelyMonetized ? <Tag tone="success">Likely monetized (est.)</Tag> : null}
        {channel.hasShorts ? <Tag tone="neutral">Has Shorts</Tag> : null}
      </div>

      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile
          label="Avg views/video"
          value={channel.avgViewsRecent === null ? "—" : formatCount(channel.avgViewsRecent)}
        />
        <StatTile label="Days since start" value={channel.daysSinceStart.toLocaleString()} />
        <StatTile label="Uploads" value={formatCount(channel.videoCount)} />
        <StatTile
          label="Outlier score"
          value={channel.outlierScore === null ? "—" : formatMultiple(channel.outlierScore)}
        />
      </dl>

      {channel.popularVideos.length > 0 ? (
        <div>
          <h4 className="mb-1.5 text-caption font-medium text-text-secondary">
            Most popular videos
          </h4>
          <ul className="grid grid-cols-2 gap-2">
            {channel.popularVideos.map((video) => (
              <li key={video.youtubeVideoId}>
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtubeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group block"
                >
                  <span className="block aspect-video overflow-hidden rounded-xs bg-bg-surface-2">
                    <Image
                      src={video.thumbnailUrl}
                      alt=""
                      width={240}
                      height={135}
                      loading="lazy"
                      unoptimized
                      className="size-full object-cover"
                    />
                  </span>
                  <p className="mt-1 line-clamp-2 text-caption text-text-primary group-hover:underline">
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

      <div className="mt-auto flex flex-wrap gap-2">
        {onTrack ? (
          <Button
            size="sm"
            variant={tracked ? "secondary" : "primary"}
            loading={tracking}
            disabled={tracked}
            onClick={() => onTrack(channel.id)}
          >
            {tracked ? "Tracking" : "Track"}
          </Button>
        ) : null}
        <Button size="sm" variant="secondary" asChild>
          <Link href={`/niches/channels/${channel.id}`}>Details</Link>
        </Button>
        {channel.niche ? (
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/niches/${channel.niche.slug}`}>Open niche</Link>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

export { DiscoveryChannelCard };
