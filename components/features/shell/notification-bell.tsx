import Link from "next/link";

import { Bell } from "lucide-react";

import { getRequestContext } from "@/lib/context";
import { getUnreadNotificationCount } from "@/lib/services/tracking";
import { Badge } from "@/components/ui/badge";

// UI-UX-Flow.md §4.2. Streamed in its own Suspense boundary (see
// app-top-bar's use) so a slow count query never blocks the shell's first
// paint. Links to the dashboard's own "Recent activity" section (UI-UX-Flow.md
// §4.5) -- there's no dedicated /notifications page in this build.
async function NotificationBell() {
  const ctx = await getRequestContext();
  const unreadCount = await getUnreadNotificationCount(ctx);

  return (
    <Link
      href="/dashboard"
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
      className="relative flex size-8 items-center justify-center rounded-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary"
    >
      <Bell className="size-4" aria-hidden="true" />
      {unreadCount > 0 ? (
        <Badge tone="accent" className="absolute -top-0.5 -right-0.5">
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      ) : null}
    </Link>
  );
}

export { NotificationBell };
