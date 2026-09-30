"use server";

import { getRequestContext } from "@/lib/context";
import {
  listChannelOutliers,
  listOutlierFeed,
  listTopOutliers,
  OUTLIER_PUBLISHED_WINDOWS,
  type OutlierItem,
  type OutlierPublishedWindow,
  type OutlierView,
} from "@/lib/services/outliers";
import {
  generateThumbnailIdeas,
  regenerateThumbnailIdeas,
  type GenerateThumbnailIdeasError,
  type ThumbnailIdeaSet,
} from "@/lib/services/thumbnail-ideas";
import type { Result } from "@/lib/result";
import type { TrackingError } from "@/lib/services/tracking";

// Thin per CLAUDE.md's Server Action pattern (same as tracking/actions.ts,
// niches/actions.ts): get the caller's context, delegate to the service,
// return its Result untouched.

// Client input: only a known publish window gets through (else the default).
function publishedWindow(value: unknown): OutlierPublishedWindow | undefined {
  return (OUTLIER_PUBLISHED_WINDOWS as readonly unknown[]).includes(value)
    ? (value as OutlierPublishedWindow)
    : undefined;
}

export async function listOutlierFeedAction(
  options: { limit?: number; cursor?: string; published?: OutlierPublishedWindow } = {},
): Promise<Result<{ items: OutlierItem[]; nextCursor: string | null }, TrackingError>> {
  const ctx = await getRequestContext();
  return listOutlierFeed(ctx, { ...options, published: publishedWindow(options.published) });
}

export async function listTopOutliersAction(options: {
  view: OutlierView;
  published?: OutlierPublishedWindow;
  limit?: number;
}): Promise<OutlierItem[]> {
  const ctx = await getRequestContext();
  return listTopOutliers(ctx, { ...options, published: publishedWindow(options.published) });
}

export async function listChannelOutliersAction(
  channelId: string,
  options: { limit?: number; cursor?: string } = {},
): Promise<Result<{ items: OutlierItem[]; nextCursor: string | null }, TrackingError>> {
  const ctx = await getRequestContext();
  return listChannelOutliers(ctx, channelId, options);
}

// Phase 2 Task 3 (Thumbnail Ideas): OutlierCard is the primary and only
// entry point, so these live here rather than a dedicated route's actions
// file -- there's no standalone page for this feature (modal-only, PRD.md
// §7.3).
export async function generateThumbnailIdeasAction(
  videoId: string,
  idempotencyKey: string,
): Promise<Result<ThumbnailIdeaSet, GenerateThumbnailIdeasError>> {
  const ctx = await getRequestContext();
  return generateThumbnailIdeas(ctx, videoId, idempotencyKey);
}

export async function regenerateThumbnailIdeasAction(
  thumbnailIdeaSetId: string,
  idempotencyKey: string,
): Promise<Result<ThumbnailIdeaSet, GenerateThumbnailIdeasError>> {
  const ctx = await getRequestContext();
  return regenerateThumbnailIdeas(ctx, thumbnailIdeaSetId, idempotencyKey);
}
