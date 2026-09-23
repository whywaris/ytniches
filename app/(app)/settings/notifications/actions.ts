"use server";

import { getRequestContext } from "@/lib/context";
import {
  getNotificationPreferences,
  listChannelNotificationOverrides,
  updateChannelNotificationOverride,
  updateNotificationPreferences,
  type ChannelNotificationOverride,
  type NotificationPreferencesSummary,
  type UpdateNotificationPreferencesInput,
} from "@/lib/services/notification-preferences";
import type { Result } from "@/lib/result";

// Thin per CLAUDE.md's Server Action pattern (same as tracking/actions.ts,
// niches/actions.ts): get the caller's context, delegate to the service,
// return its Result untouched.

export async function getNotificationPreferencesAction(): Promise<NotificationPreferencesSummary> {
  const ctx = await getRequestContext();
  return getNotificationPreferences(ctx);
}

export async function updateNotificationPreferencesAction(
  input: UpdateNotificationPreferencesInput,
): Promise<Result<void, never>> {
  const ctx = await getRequestContext();
  return updateNotificationPreferences(ctx, input);
}

export async function listChannelNotificationOverridesAction(): Promise<
  ChannelNotificationOverride[]
> {
  const ctx = await getRequestContext();
  return listChannelNotificationOverrides(ctx);
}

export async function updateChannelNotificationOverrideAction(
  channelId: string,
  enabled: boolean,
): Promise<void> {
  const ctx = await getRequestContext();
  return updateChannelNotificationOverride(ctx, channelId, enabled);
}
