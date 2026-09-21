import type { ActivityFeedNotification } from "@/components/features/tracking/types";
import type { TrackingError } from "@/lib/services/tracking";
import type { Result } from "@/lib/result";

// UI-UX-Flow.md §6.6's four states for the overview feed. Shared between
// page.tsx (mapping the server-side initial load) and tracking-client.tsx
// (mapping a client-triggered re-fetch on filter/range change), same
// reasoning as niches/search-state.ts.
export type ActivityFeedState =
  | { status: "loading" }
  | { status: "populated"; notifications: ActivityFeedNotification[]; nextCursor: string | null }
  | { status: "empty" }
  | { status: "error"; message: string };

export function toActivityFeedState(
  result: Result<
    { notifications: ActivityFeedNotification[]; nextCursor: string | null },
    TrackingError
  >,
): ActivityFeedState {
  if (!result.ok) {
    return { status: "error", message: "Something went wrong loading your activity feed." };
  }
  return result.value.notifications.length === 0
    ? { status: "empty" }
    : {
        status: "populated",
        notifications: result.value.notifications,
        nextCursor: result.value.nextCursor,
      };
}
