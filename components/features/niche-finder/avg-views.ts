import { AVG_VIEWS_WINDOW_DAYS } from "@/lib/channels/views";
import type { ViewsStatus } from "@/lib/services/channels";

// D-085: a channel whose videos we haven't stored yet isn't "0 views".
// Returns the label to show instead of the 30-day average, or null when
// the average is measured and should be shown as a number.
export function unmeasuredViewsLabel(status: ViewsStatus): string | null {
  switch (status) {
    case "pending":
      return "Views pending";
    case "no_recent_uploads":
      return `No uploads in ${AVG_VIEWS_WINDOW_DAYS} days`;
    case "measured":
      return null;
  }
}

// For sorting and comparisons: unmeasured channels rank below any real
// average (which is always >= 0).
export function rankableAvgViews(channel: {
  viewsStatus: ViewsStatus;
  avgViewsLast30Days: number;
}): number {
  return channel.viewsStatus === "measured" ? channel.avgViewsLast30Days : -1;
}
