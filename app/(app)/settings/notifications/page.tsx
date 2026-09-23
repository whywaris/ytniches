import { getRequestContext } from "@/lib/context";
import {
  getNotificationPreferences,
  listChannelNotificationOverrides,
} from "@/lib/services/notification-preferences";
import { NotificationsClient } from "@/app/(app)/settings/notifications/notifications-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications — YTNiches",
};

// UI-UX-Flow.md §6.4/§8.1.2. Server Component for the first paint, same
// server/client split as the rest of the app's settings + tracking pages.
export default async function NotificationSettingsPage() {
  const ctx = await getRequestContext();
  const [preferences, channelOverrides] = await Promise.all([
    getNotificationPreferences(ctx),
    listChannelNotificationOverrides(ctx),
  ]);

  return (
    <NotificationsClient
      initialPreferences={preferences}
      initialChannelOverrides={channelOverrides}
    />
  );
}
