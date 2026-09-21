"use server";

import { getRequestContext } from "@/lib/context";
import {
  addChannelToTracking,
  dismissNotification,
  getActivityFeed,
  getChannelActivity,
  markNotificationRead,
  previewChannelFromUrl,
  removeChannelFromTracking,
  type AlreadyTrackedError,
  type ChannelPreview,
  type InvalidUrlError,
  type NotTrackedError,
  type TierLimitError,
  type TrackedChannel,
  type TrackedEvent,
  type TrackingError,
} from "@/lib/services/tracking";
import { joinNotificationChannels } from "@/app/(app)/tracking/notification-refs";
import { ok, type Result } from "@/lib/result";
import type { NotFoundError } from "@/lib/services/channels";
import type { ActivityFeedNotification } from "@/components/features/tracking/types";

// Thin per CLAUDE.md's Server Action pattern (same as niches/actions.ts):
// get the caller's context, delegate to the service, return its Result
// untouched. No business logic here.

export async function getActivityFeedAction(
  options: {
    limit?: number;
    cursor?: string;
    filter?: "all" | "new_video" | "view_spike" | "cadence_change";
    since?: string;
  } = {},
): Promise<
  Result<{ notifications: ActivityFeedNotification[]; nextCursor: string | null }, TrackingError>
> {
  const ctx = await getRequestContext();
  const result = await getActivityFeed(ctx, options);
  if (!result.ok) {
    return result;
  }

  const notifications = await joinNotificationChannels(result.value.notifications);
  return ok({ notifications, nextCursor: result.value.nextCursor });
}

export async function getChannelActivityAction(
  channelId: string,
  options: { limit?: number; cursor?: string } = {},
): Promise<Result<{ events: TrackedEvent[]; nextCursor: string | null }, TrackingError>> {
  const ctx = await getRequestContext();
  return getChannelActivity(ctx, channelId, options);
}

// Not one of the six passthroughs, but necessary glue: the add-channel
// modal's "Paste URL" tab needs to preview a channel (Application-Flow.md
// §4.2's validating state) before the user confirms adding it.
export async function validateChannelUrlAction(
  url: string,
): Promise<Result<ChannelPreview, InvalidUrlError | NotFoundError>> {
  return previewChannelFromUrl(url);
}

export async function addChannelToTrackingAction(
  input: { channelId: string } | { url: string },
): Promise<
  Result<TrackedChannel, AlreadyTrackedError | TierLimitError | InvalidUrlError | NotFoundError>
> {
  const ctx = await getRequestContext();
  return addChannelToTracking(ctx, input);
}

export async function removeChannelFromTrackingAction(
  channelId: string,
): Promise<Result<void, NotTrackedError>> {
  const ctx = await getRequestContext();
  return removeChannelFromTracking(ctx, channelId);
}

export async function markNotificationReadAction(
  notificationId: string,
): Promise<Result<void, NotFoundError>> {
  const ctx = await getRequestContext();
  return markNotificationRead(ctx, notificationId);
}

export async function dismissNotificationAction(
  notificationId: string,
): Promise<Result<void, NotFoundError>> {
  const ctx = await getRequestContext();
  return dismissNotification(ctx, notificationId);
}
