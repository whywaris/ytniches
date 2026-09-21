import { resolveChannelUrl } from "@/lib/youtube";
import { createClient } from "@/lib/supabase/server";
import { err, ok, type Result } from "@/lib/result";
import {
  saveChannelToTracking,
  type NotFoundError,
  type SaveChannelError,
} from "@/lib/services/channels";
import type { RequestContext } from "@/lib/context";
import type { Database } from "@/lib/supabase/database.types";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export type TrackingError = { type: "invalid_cursor" };
export type AlreadyTrackedError = { type: "already_tracked" };
export type TierLimitError = SaveChannelError;
export type InvalidUrlError = { type: "invalid_url" };
export type NotTrackedError = { type: "not_tracked" };

export interface NotificationWithEvent {
  id: string;
  notificationType: string;
  title: string;
  body: string | null;
  relatedResource: string | null;
  readAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
}

export interface TrackedEvent {
  id: string;
  channelId: string;
  eventType: Database["public"]["Enums"]["tracked_event_type"];
  payload: Record<string, unknown>;
  detectedAt: string;
}

export interface TrackedChannel {
  id: string;
  channelId: string;
  trackedSince: string;
  customLabel: string | null;
  refreshCadenceHours: number;
  notificationsEnabled: boolean;
}

// Keyset pagination cursor. Spec calls this "base64url-encoded notification/
// event ID," but a bare UUID isn't sortable by time (gen_random_uuid() is
// v4, not ordered) -- the cursor carries the sort timestamp alongside the ID
// so a tie at the same instant still resolves deterministically.
interface FeedCursor {
  id: string;
  sortKey: string;
}

function encodeCursor(id: string, sortKey: string): string {
  return Buffer.from(JSON.stringify({ id, sortKey })).toString("base64url");
}

function decodeCursor(cursor: string): FeedCursor | null {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      typeof (parsed as FeedCursor).id === "string" &&
      typeof (parsed as FeedCursor).sortKey === "string"
    ) {
      return parsed as FeedCursor;
    }
    return null;
  } catch {
    return null;
  }
}

function clampLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(1, limit), MAX_PAGE_SIZE);
}

function toNotificationWithEvent(
  row: Database["public"]["Tables"]["notifications"]["Row"],
): NotificationWithEvent {
  return {
    id: row.id,
    notificationType: row.notification_type,
    title: row.title,
    body: row.body,
    relatedResource: row.related_resource,
    readAt: row.read_at,
    dismissedAt: row.dismissed_at,
    createdAt: row.created_at,
  };
}

function toTrackedEvent(row: Database["public"]["Tables"]["tracked_events"]["Row"]): TrackedEvent {
  return {
    id: row.id,
    channelId: row.channel_id,
    eventType: row.event_type,
    payload: row.payload as Record<string, unknown>,
    detectedAt: row.detected_at,
  };
}

function toTrackedChannel(
  row: Database["public"]["Tables"]["tracked_channels"]["Row"],
): TrackedChannel {
  return {
    id: row.id,
    channelId: row.channel_id,
    trackedSince: row.tracked_since,
    customLabel: row.custom_label,
    refreshCadenceHours: row.refresh_cadence_hours,
    notificationsEnabled: row.notifications_enabled,
  };
}

// PRD.md §6.2 "Overview: recent activity across all tracked channels" --
// reads from notifications (per-user, already fanned-out and composed by
// workers/channel-sync.ts), not tracked_events directly, so a user only
// ever sees activity for channels they track and never re-derives the
// notification text themselves.
export async function getActivityFeed(
  ctx: RequestContext,
  options: {
    limit?: number;
    cursor?: string;
    filter?: "all" | "new_video" | "view_spike" | "cadence_change";
  } = {},
): Promise<
  Result<{ notifications: NotificationWithEvent[]; nextCursor: string | null }, TrackingError>
> {
  const limit = clampLimit(options.limit);

  let cursor: FeedCursor | null = null;
  if (options.cursor) {
    cursor = decodeCursor(options.cursor);
    if (!cursor) {
      return err({ type: "invalid_cursor" });
    }
  }

  const supabase = await createClient();
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (options.filter && options.filter !== "all") {
    query = query.eq("notification_type", options.filter);
  }
  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.sortKey},and(created_at.eq.${cursor.sortKey},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`getActivityFeed query failed: ${error.message}`);
  }

  const hasMore = data.length > limit;
  const page = data.slice(0, limit);
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.id, last.created_at) : null;

  return ok({ notifications: page.map(toNotificationWithEvent), nextCursor });
}

// PRD.md §6.2 "Per-channel drill-down: full video list + activity timeline"
// -- reads tracked_events directly (channel-global, not user-scoped), gated
// by that table's own RLS policy (only trackers of this channel can see its
// events). A non-tracker gets an empty page, not an error.
export async function getChannelActivity(
  ctx: RequestContext,
  channelId: string,
  options: { limit?: number; cursor?: string } = {},
): Promise<Result<{ events: TrackedEvent[]; nextCursor: string | null }, TrackingError>> {
  void ctx; // RLS (not app code) scopes access -- see comment above.
  const limit = clampLimit(options.limit);

  let cursor: FeedCursor | null = null;
  if (options.cursor) {
    cursor = decodeCursor(options.cursor);
    if (!cursor) {
      return err({ type: "invalid_cursor" });
    }
  }

  const supabase = await createClient();
  let query = supabase
    .from("tracked_events")
    .select("*")
    .eq("channel_id", channelId)
    .order("detected_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.or(
      `detected_at.lt.${cursor.sortKey},and(detected_at.eq.${cursor.sortKey},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`getChannelActivity query failed: ${error.message}`);
  }

  const hasMore = data.length > limit;
  const page = data.slice(0, limit);
  const last = page[page.length - 1];
  const nextCursor = hasMore && last ? encodeCursor(last.id, last.detected_at) : null;

  return ok({ events: page.map(toTrackedEvent), nextCursor });
}

async function findTrackedChannelRow(
  ctx: RequestContext,
  channelId: string,
): Promise<Database["public"]["Tables"]["tracked_channels"]["Row"]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracked_channels")
    .select("*")
    .eq("user_id", ctx.userId)
    .eq("channel_id", channelId)
    .single();

  if (error) {
    throw new Error(`findTrackedChannelRow query failed: ${error.message}`);
  }
  return data;
}

// Application-Flow.md §4.2's validating -> previewing -> adding states:
// a URL input resolves to a channel ID first (validating), then both input
// shapes converge on the same saveChannelToTracking call (adding).
// already_tracked never actually surfaces -- saveChannelToTracking treats a
// duplicate save as idempotent Ok (Application-Flow.md §5.8) -- kept in the
// error union for signature completeness / forward compatibility.
export async function addChannelToTracking(
  ctx: RequestContext,
  input: { channelId: string } | { url: string },
): Promise<
  Result<TrackedChannel, AlreadyTrackedError | TierLimitError | InvalidUrlError | NotFoundError>
> {
  let channelId: string;

  if ("url" in input) {
    const resolved = await resolveChannelUrl(input.url);
    if (!resolved.ok) {
      if (resolved.error.type === "not_found") {
        return err({ type: "not_found" });
      }
      // invalid_url, plus any transient YouTube-side failure (quota,
      // network, API, bad response) -- all mean "couldn't validate this URL
      // right now," which the caller should treat as the same invalid-URL
      // state (Application-Flow.md §4.2's `invalid`), not a distinct case.
      return err({ type: "invalid_url" });
    }
    channelId = resolved.value;
  } else {
    channelId = input.channelId;
  }

  const saveResult = await saveChannelToTracking(ctx, channelId);
  if (!saveResult.ok) {
    return err(saveResult.error);
  }

  const row = await findTrackedChannelRow(ctx, channelId);
  return ok(toTrackedChannel(row));
}

export async function removeChannelFromTracking(
  ctx: RequestContext,
  channelId: string,
): Promise<Result<void, NotTrackedError>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tracked_channels")
    .delete()
    .eq("user_id", ctx.userId)
    .eq("channel_id", channelId)
    .select("id");

  if (error) {
    throw new Error(`removeChannelFromTracking delete failed: ${error.message}`);
  }
  if (data.length === 0) {
    return err({ type: "not_tracked" });
  }

  return ok(undefined);
}

// Both use the session client, not the service role: Backend-Schema.md
// §4.3's narrow column grant already restricts `authenticated` to updating
// only (read_at, dismissed_at) on rows it owns -- RLS makes a wrong-user
// notification invisible rather than erroring, so 0 rows updated is how
// "not mine" and "doesn't exist" both surface, and both mean not_found here.
export async function markNotificationRead(
  ctx: RequestContext,
  notificationId: string,
): Promise<Result<void, NotFoundError>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", ctx.userId)
    .select("id");

  if (error) {
    throw new Error(`markNotificationRead update failed: ${error.message}`);
  }
  if (data.length === 0) {
    return err({ type: "not_found" });
  }

  return ok(undefined);
}

export async function dismissNotification(
  ctx: RequestContext,
  notificationId: string,
): Promise<Result<void, NotFoundError>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", ctx.userId)
    .select("id");

  if (error) {
    throw new Error(`dismissNotification update failed: ${error.message}`);
  }
  if (data.length === 0) {
    return err({ type: "not_found" });
  }

  return ok(undefined);
}
