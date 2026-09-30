import * as React from "react";

import Image from "next/image";
import Link from "next/link";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import type { CompetitionLabel, NicheStatus } from "@/lib/discovery/scoring";
import type { NicheFeedItem } from "@/lib/services/niche-feed";

// Niche-Discovery-Engine.md §9.2. Presentational: the Track action is a
// callback so the card never imports a server action (same split as
// ChannelCard's onSave).

export interface NicheCardProps {
  niche: NicheFeedItem;
  onTrack?: (slug: string) => void;
  tracking?: boolean;
  className?: string;
}

const STATUS_COPY: Record<
  NicheStatus,
  { label: string; tone: "success" | "warning" | "error" | "neutral" }
> = {
  rising: { label: "Rising", tone: "success" },
  active: { label: "Active", tone: "neutral" },
  saturated: { label: "Saturated", tone: "warning" },
  declining: { label: "Declining", tone: "error" },
};

export const LABEL_COPY: Record<CompetitionLabel, string> = {
  low: "Low competition",
  medium: "Medium competition",
  high: "High competition",
};

function TrendArrow({ trend }: { trend: number | null }) {
  if (trend === null) {
    return <span className="text-caption text-text-tertiary">New</span>;
  }
  const Icon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-body-sm font-medium tabular-nums",
        trend > 0 && "text-success",
        trend < 0 && "text-error",
        trend === 0 && "text-text-tertiary",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="sr-only">{trend >= 0 ? "Up" : "Down"} </span>
      {trend > 0 ? `+${trend}` : trend}
      <span className="sr-only"> in 7 days</span>
    </span>
  );
}

function NicheCard({ niche, onTrack, tracking = false, className }: NicheCardProps) {
  const status = STATUS_COPY[niche.status];
  const topOutlier = niche.thumbnails[0];

  return (
    <Card className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-h4 font-semibold text-text-primary">
            <Link href={`/niches/${niche.slug}`} className="hover:underline">
              {niche.name}
            </Link>
          </h3>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Tag tone={status.tone}>{status.label}</Tag>
            <Tag tone={niche.label === "low" ? "success" : "neutral"}>
              {LABEL_COPY[niche.label]}
            </Tag>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p
            className="text-h2 leading-none font-semibold text-text-primary tabular-nums"
            aria-label={`Opportunity score ${niche.score} out of 100`}
          >
            {niche.score}
          </p>
          <TrendArrow trend={niche.trend} />
        </div>
      </div>

      {niche.whyChips.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Why this niche">
          {niche.whyChips.map((chip) => (
            <li key={chip}>
              <Tag tone="niches">{chip}</Tag>
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="grid grid-cols-3 gap-2 text-caption text-text-secondary">
        <div>
          <dt>Channels</dt>
          <dd className="text-body-sm font-medium text-text-primary tabular-nums">
            {formatCount(niche.channelCount)}
          </dd>
        </div>
        <div>
          <dt>New this month</dt>
          <dd className="text-body-sm font-medium text-text-primary tabular-nums">
            {formatCount(niche.newChannels30d)}
          </dd>
        </div>
        <div>
          <dt>Median views</dt>
          <dd className="text-body-sm font-medium text-text-primary tabular-nums">
            {niche.medianViews === null ? "—" : formatCount(niche.medianViews)}
          </dd>
        </div>
      </dl>

      {niche.thumbnails.length > 0 ? (
        <div className="grid grid-cols-3 gap-1.5">
          {niche.thumbnails.map((thumb) => (
            <a
              key={thumb.youtubeVideoId}
              href={`https://www.youtube.com/watch?v=${thumb.youtubeVideoId}`}
              target="_blank"
              rel="noreferrer"
              title={thumb.title}
            >
              <span className="block aspect-video overflow-hidden rounded-xs bg-bg-surface-2">
                <Image
                  src={thumb.thumbnailUrl}
                  alt={thumb.title}
                  width={160}
                  height={90}
                  loading="lazy"
                  unoptimized
                  className="size-full object-cover"
                />
              </span>
            </a>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2">
        <Button size="sm" asChild>
          <Link href={`/niches/${niche.slug}`}>View niche</Link>
        </Button>
        {onTrack ? (
          <Button
            size="sm"
            variant="secondary"
            loading={tracking}
            onClick={() => onTrack(niche.slug)}
          >
            Track
          </Button>
        ) : null}
        {topOutlier ? (
          <Button size="sm" variant="secondary" asChild>
            <Link href={`/prompts?channelId=${topOutlier.channelId}&videoId=${topOutlier.videoId}`}>
              Generate prompts
            </Link>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

export { NicheCard };
