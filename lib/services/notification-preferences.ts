import { isEmailEligibleTier } from "@/lib/billing";
import { getSubscriptionStatus } from "@/lib/services/billing";
import { listTrackedChannelsSummary } from "@/lib/services/tracking";
import { createClient } from "@/lib/supabase/server";
import { ok, type Result } from "@/lib/result";
import type { RequestContext } from "@/lib/context";

// The four implemented tracked_event_type values (subscriber_milestone has
// no detector yet, per workers/channel-sync.ts).
export type NotificationEventType =
  "new_video" | "view_spike" | "cadence_change" | "outlier_detected";
const NOTIFICATION_TYPES: NotificationEventType[] = [
  "new_video",
  "view_spike",
  "cadence_change",
  "outlier_detected",
];

export type DigestCadence = "off" | "daily" | "weekly";

export interface PerTypePreference {
  type: NotificationEventType;
  inAppEnabled: boolean;
  emailEnabled: boolean;
}

export interface NotificationPreferencesSummary {
  perType: PerTypePreference[];
  digestCadence: DigestCadence;
  digestDayOfWeek: number;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  // Monetization.md §2.5 (Phase 2 Task 2 gap 1): email-only controls are
  // gated Pro/Team. The UI keeps them visible either way and shows an
  // upgrade prompt when this is false, rather than hiding them.
  emailAvailable: boolean;
}

function isDigestCadence(value: string): value is DigestCadence {
  return value === "off" || value === "daily" || value === "weekly";
}

// UI-UX-Flow.md §6.4's global toggles + digest + quiet hours. No rows
// exist yet for a user who's never touched this page (Phase 1 built the
// table, not the UI) -- defaults below match each column's own DB default.
export async function getNotificationPreferences(
  ctx: RequestContext,
): Promise<NotificationPreferencesSummary> {
  const supabase = await createClient();
  const [{ data: prefRows, error: prefError }, subscription] = await Promise.all([
    supabase.from("notification_preferences").select("*").eq("user_id", ctx.userId),
    getSubscriptionStatus(ctx),
  ]);

  if (prefError) {
    throw new Error(`getNotificationPreferences query failed: ${prefError.message}`);
  }

  // Effective tier (D-059): Team workspace members get email too.
  const emailAvailable = isEmailEligibleTier(ctx.tier ?? subscription?.tier);
  const rowByType = new Map(prefRows.map((row) => [row.notification_type, row]));

  const perType = NOTIFICATION_TYPES.map((type) => {
    const row = rowByType.get(type);
    return {
      type,
      inAppEnabled: row?.in_app_enabled ?? true,
      emailEnabled: row?.email_enabled ?? false,
    };
  });

  // Gap 2: digest_cadence/digest_day_of_week/quiet_hours are duplicated
  // identically across every one of a user's rows -- any single row is
  // authoritative, so the first one is as good as any.
  const anyRow = prefRows[0];

  return {
    perType,
    digestCadence: anyRow && isDigestCadence(anyRow.digest_cadence) ? anyRow.digest_cadence : "off",
    digestDayOfWeek: anyRow?.digest_day_of_week ?? 1,
    quietHoursStart: anyRow?.quiet_hours_start ?? null,
    quietHoursEnd: anyRow?.quiet_hours_end ?? null,
    emailAvailable,
  };
}

export interface UpdateNotificationPreferencesInput {
  perType: PerTypePreference[];
  digestCadence: DigestCadence;
  digestDayOfWeek: number;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

// Writes all NOTIFICATION_TYPES rows in one upsert, each carrying its own
// in_app/email booleans but the *same* global fields (gap 2) -- and
// re-enforces the tier gate server-side regardless of what the client sent
// (gap 1: the UI toggle is not the trust boundary), same as
// workers/channel-sync.ts's fanOutNotifications.
export async function updateNotificationPreferences(
  ctx: RequestContext,
  input: UpdateNotificationPreferencesInput,
): Promise<Result<void, never>> {
  const supabase = await createClient();
  const subscription = await getSubscriptionStatus(ctx);
  const emailAvailable = isEmailEligibleTier(ctx.tier ?? subscription?.tier);

  const rows = input.perType.map((pref) => ({
    user_id: ctx.userId,
    notification_type: pref.type,
    in_app_enabled: pref.inAppEnabled,
    email_enabled: emailAvailable ? pref.emailEnabled : false,
    digest_cadence: emailAvailable ? input.digestCadence : "off",
    digest_day_of_week: input.digestDayOfWeek,
    quiet_hours_start: emailAvailable ? input.quietHoursStart : null,
    quiet_hours_end: emailAvailable ? input.quietHoursEnd : null,
  }));

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(rows, { onConflict: "user_id,notification_type" });

  if (error) {
    throw new Error(`updateNotificationPreferences upsert failed: ${error.message}`);
  }

  return ok(undefined);
}

export interface ChannelNotificationOverride {
  channelId: string;
  channelName: string;
  avatarUrl: string | null;
  notificationsEnabled: boolean;
}

// UI-UX-Flow.md §6.4's "Table: channel | notifications on/off." No row in
// notification_channel_overrides = no override yet = follows the type-level
// defaults, so it displays as enabled (Backend-Schema.md §4.4).
export async function listChannelNotificationOverrides(
  ctx: RequestContext,
): Promise<ChannelNotificationOverride[]> {
  const trackedChannels = await listTrackedChannelsSummary(ctx);
  if (trackedChannels.length === 0) return [];

  const supabase = await createClient();
  const { data: overrides, error } = await supabase
    .from("notification_channel_overrides")
    .select("channel_id, notifications_enabled")
    .eq("user_id", ctx.userId)
    .in(
      "channel_id",
      trackedChannels.map((channel) => channel.id),
    );

  if (error) {
    throw new Error(`listChannelNotificationOverrides query failed: ${error.message}`);
  }

  const overrideByChannel = new Map(
    (overrides ?? []).map((row) => [row.channel_id, row.notifications_enabled]),
  );

  return trackedChannels.map((channel) => ({
    channelId: channel.id,
    channelName: channel.name,
    avatarUrl: channel.avatarUrl,
    notificationsEnabled: overrideByChannel.get(channel.id) ?? true,
  }));
}

export async function updateChannelNotificationOverride(
  ctx: RequestContext,
  channelId: string,
  enabled: boolean,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notification_channel_overrides")
    .upsert(
      { user_id: ctx.userId, channel_id: channelId, notifications_enabled: enabled },
      { onConflict: "user_id,channel_id" },
    );

  if (error) {
    throw new Error(`updateChannelNotificationOverride upsert failed: ${error.message}`);
  }
}
