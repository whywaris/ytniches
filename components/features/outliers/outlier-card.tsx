"use client";

import * as React from "react";

import Image from "next/image";

import { formatRelativeTime } from "@/lib/format-relative-time";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { ThumbnailIdeasModal } from "@/components/features/outliers/thumbnail-ideas-modal";
import type { OutlierItem } from "@/lib/services/outliers";

export interface OutlierCardProps {
  outlier: OutlierItem;
  /** false on the per-channel Outliers tab, where the channel is already
   * implied by the page; true on the cross-channel feed/grid/trending views. */
  showChannel?: boolean;
}

const PUBLISHED_DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

// PRD.md §7.1's outlier card: video + score + the "one-click extract
// prompts from this outlier" output, which is just a link into the
// existing prompt generator with the video preselected (Phase OC). Phase 2
// Task 3 adds a second entry point -- "Get thumbnail ideas" opens
// ThumbnailIdeasModal, the primary entry point for that feature.
function OutlierCard({ outlier, showChannel = true }: OutlierCardProps) {
  const [thumbnailModalOpen, setThumbnailModalOpen] = React.useState(false);

  return (
    <Card variant="base" padding="md" className="flex gap-3">
      <Image
        src={outlier.videoThumbnailUrl}
        alt=""
        width={128}
        height={72}
        className="h-[72px] w-32 shrink-0 rounded-xs object-cover"
        unoptimized
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-body text-text-primary">{outlier.videoTitle}</p>
          {/* D-085: the true multiple. outlierScore (decayed by age) only ranks. */}
          <Tag tone="outliers" className="shrink-0">
            {outlier.multiple.toFixed(1)}x baseline
          </Tag>
        </div>

        {showChannel ? (
          <div className="flex items-center gap-1.5 text-caption text-text-tertiary">
            <Avatar
              size="xs"
              src={outlier.channelAvatarUrl ?? undefined}
              fallback={outlier.channelName.slice(0, 2).toUpperCase()}
            />
            <span className="truncate">{outlier.channelName}</span>
          </div>
        ) : null}

        <p className="text-caption text-text-tertiary">
          {formatCount(outlier.viewCount)} views &middot; baseline {formatCount(outlier.baseline)}{" "}
          &middot; published{" "}
          <time dateTime={outlier.publishedAt}>
            {PUBLISHED_DATE.format(new Date(outlier.publishedAt))}
          </time>{" "}
          &middot; detected {formatRelativeTime(outlier.detectedAt)}
        </p>

        <div className="mt-1 flex gap-2">
          <Button size="sm" variant="secondary" asChild>
            <a href={`/prompts?channelId=${outlier.channelId}&videoId=${outlier.videoId}`}>
              Extract prompts
            </a>
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setThumbnailModalOpen(true)}>
            Get thumbnail ideas
          </Button>
        </div>
      </div>

      <ThumbnailIdeasModal
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
        video={{
          id: outlier.videoId,
          title: outlier.videoTitle,
          thumbnailUrl: outlier.videoThumbnailUrl,
        }}
      />
    </Card>
  );
}

export { OutlierCard };
