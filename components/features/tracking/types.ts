// UI-layer names for what these feature components render, decoupled from
// lib/services/tracking.ts the same way niche-finder/types.ts decouples
// from lib/services/channels.ts. The service's NotificationWithEvent/
// TrackedChannel types don't carry channel display data (avatar/name) —
// Backend-Schema.md doesn't denormalize it onto notifications or
// tracked_channels — so the page layer (Phase 2D pages) is responsible for
// joining it in before handing props to these components.
export interface ActivityFeedChannelRef {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface ActivityFeedNotification {
  id: string;
  notificationType: string;
  title: string;
  body: string | null;
  createdAt: string;
  readAt: string | null;
  dismissedAt: string | null;
  channel: ActivityFeedChannelRef;
  /** Set for Discovery Engine niche notes (related_resource "niche:<slug>"). */
  niche?: { slug: string; name: string };
}

export interface TrackedChannelSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  lastActivityAt: string | null;
}
