import type { OutlierItem } from "@/lib/services/outliers";
import type { TrackingError } from "@/lib/services/tracking";
import type { Result } from "@/lib/result";

// Same four-state shape as tracking/activity-feed-state.ts, for the Feed
// tab only -- Grid/Trending are a plain ranked array (lib/services/
// outliers.ts's listTopOutliers), not a cursor feed, so they don't need
// this.
export type OutlierFeedState =
  | { status: "loading" }
  | { status: "populated"; items: OutlierItem[]; nextCursor: string | null }
  | { status: "empty" }
  | { status: "error"; message: string };

export function toOutlierFeedState(
  result: Result<{ items: OutlierItem[]; nextCursor: string | null }, TrackingError>,
): OutlierFeedState {
  if (!result.ok) {
    return { status: "error", message: "Something went wrong loading outliers." };
  }
  return result.value.items.length === 0
    ? { status: "empty" }
    : { status: "populated", items: result.value.items, nextCursor: result.value.nextCursor };
}
