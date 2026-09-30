import { createClient } from "@/lib/supabase/server";
import type { NotificationWithEvent } from "@/lib/services/tracking";
import type { ActivityFeedNotification } from "@/components/features/tracking/types";

interface ParsedResource {
  type: "video" | "channel" | "niche";
  id: string;
}

function parseRelatedResource(raw: string | null): ParsedResource | null {
  if (!raw) return null;
  const [type, id] = raw.split(":");
  if ((type === "video" || type === "channel" || type === "niche") && id) {
    return { type, id };
  }
  return null;
}

const UNKNOWN_CHANNEL = { id: "", name: "Unknown channel", avatarUrl: null as string | null };

// Backend-Schema.md §4.3: notifications don't carry a channel_id column,
// only `related_resource` ("video:<id>" | "channel:<id>" | "niche:<slug>") -- see
// components/features/tracking/types.ts's own note that the page layer is
// responsible for this join. Resolves every notification's display channel
// in at most two batched queries (videos, then channels), regardless of
// how many notifications are on the page.
export async function joinNotificationChannels(
  notifications: NotificationWithEvent[],
): Promise<ActivityFeedNotification[]> {
  if (notifications.length === 0) return [];

  const supabase = await createClient();
  const parsed = notifications.map((notification) => ({
    notification,
    ref: parseRelatedResource(notification.relatedResource),
  }));

  const videoIds = [
    ...new Set(
      parsed
        .filter((p) => p.ref?.type === "video")
        .map((p) => p.ref?.id)
        .filter((id) => id !== undefined),
    ),
  ];
  const videoChannelId = new Map<string, string>();
  if (videoIds.length > 0) {
    const { data, error } = await supabase
      .from("videos")
      .select("id, channel_id")
      .in("id", videoIds);
    if (error) {
      throw new Error(`joinNotificationChannels videos query failed: ${error.message}`);
    }
    for (const row of data) {
      videoChannelId.set(row.id, row.channel_id);
    }
  }

  const channelIds = [
    ...new Set(
      parsed.flatMap((p) => {
        if (!p.ref) return [];
        const channelId = p.ref.type === "channel" ? p.ref.id : videoChannelId.get(p.ref.id);
        return channelId ? [channelId] : [];
      }),
    ),
  ];
  const channelById = new Map<string, { id: string; name: string; avatarUrl: string | null }>();
  if (channelIds.length > 0) {
    const { data, error } = await supabase
      .from("channels")
      .select("id, name, avatar_url")
      .in("id", channelIds);
    if (error) {
      throw new Error(`joinNotificationChannels channels query failed: ${error.message}`);
    }
    for (const row of data) {
      channelById.set(row.id, { id: row.id, name: row.name, avatarUrl: row.avatar_url });
    }
  }

  const nicheSlugs = [
    ...new Set(parsed.flatMap((p) => (p.ref?.type === "niche" ? [p.ref.id] : []))),
  ];
  const nicheBySlug = new Map<string, { slug: string; name: string }>();
  if (nicheSlugs.length > 0) {
    const { data, error } = await supabase
      .from("niches")
      .select("slug, name")
      .in("slug", nicheSlugs);
    if (error) {
      throw new Error(`joinNotificationChannels niches query failed: ${error.message}`);
    }
    for (const row of data) nicheBySlug.set(row.slug, row);
  }

  return parsed.map(({ notification, ref }) => {
    let channel = UNKNOWN_CHANNEL;
    const niche = ref?.type === "niche" ? nicheBySlug.get(ref.id) : undefined;
    if (ref && ref.type !== "niche") {
      const channelId = ref.type === "channel" ? ref.id : videoChannelId.get(ref.id);
      if (channelId) {
        channel = channelById.get(channelId) ?? UNKNOWN_CHANNEL;
      }
    }
    return {
      id: notification.id,
      notificationType: notification.notificationType,
      title: notification.title,
      body: notification.body,
      createdAt: notification.createdAt,
      readAt: notification.readAt,
      dismissedAt: notification.dismissedAt,
      channel,
      ...(niche ? { niche } : {}),
    };
  });
}
