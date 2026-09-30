import { Bell, Compass, RefreshCw, TrendingUp, Video, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/format-relative-time";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ActivityFeedNotification } from "@/components/features/tracking/types";

// UI-UX-Flow.md §6.1's activity feed card. Presentational only — no network
// calls; onGoToChannel/onDismiss are callbacks, the parent page owns the
// markNotificationRead/dismissNotification Server Action calls (Phase 2D).
// "Extract prompts" is explicitly out of scope here (Task 3), and "Save to
// notes" isn't built yet, so actions are narrowed to just these two.
export interface ActivityFeedItemProps {
  notification: ActivityFeedNotification;
  onGoToChannel?: (channelId: string) => void;
  /** Niche notes (notification.niche set) open the niche instead. */
  onOpenNiche?: (slug: string) => void;
  onDismiss?: (notificationId: string) => void;
  className?: string;
}

const EVENT_META: Record<string, { icon: LucideIcon; label: string }> = {
  new_video: { icon: Video, label: "New video" },
  view_spike: { icon: TrendingUp, label: "View spike" },
  cadence_change: { icon: RefreshCw, label: "Upload cadence changed" },
  niche_update: { icon: Compass, label: "Tracked niche" },
};

function ActivityFeedItem({
  notification,
  onGoToChannel,
  onOpenNiche,
  onDismiss,
  className,
}: ActivityFeedItemProps) {
  const meta = EVENT_META[notification.notificationType] ?? { icon: Bell, label: "Activity" };
  const Icon = meta.icon;
  const isDismissed = notification.dismissedAt !== null;
  const isUnread = !isDismissed && notification.readAt === null;

  return (
    <Card
      variant="base"
      padding="md"
      className={cn(
        "flex flex-col gap-2 border-l-2 border-l-transparent",
        isUnread && "border-l-accent",
        isDismissed && "opacity-50",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {notification.niche ? (
            <Compass className="size-5 shrink-0 text-object-niches" aria-hidden="true" />
          ) : (
            <Avatar
              size="sm"
              src={notification.channel.avatarUrl ?? undefined}
              fallback={notification.channel.name.slice(0, 2).toUpperCase()}
            />
          )}
          <span className="truncate text-body-sm font-medium text-text-primary">
            {notification.niche?.name ?? notification.channel.name}
          </span>
        </div>
        <span className="shrink-0 text-caption text-text-tertiary">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-body-sm text-text-secondary">
        <Icon className="size-3.5" aria-hidden="true" />
        <span>{meta.label}</span>
      </div>

      <div>
        <p className="text-body font-medium text-text-primary">{notification.title}</p>
        {notification.body ? (
          <p className="text-body-sm text-text-secondary">{notification.body}</p>
        ) : null}
      </div>

      {!isDismissed ? (
        <div className="mt-1 flex items-center gap-2">
          {notification.niche ? (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => onOpenNiche?.(notification.niche!.slug)}
            >
              Open niche
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="xs"
              onClick={() => onGoToChannel?.(notification.channel.id)}
            >
              Go to channel
            </Button>
          )}
          <Button variant="ghost" size="xs" onClick={() => onDismiss?.(notification.id)}>
            Dismiss
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

export { ActivityFeedItem };
