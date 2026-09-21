"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Activity } from "lucide-react";

import { searchNichesAction } from "@/app/(app)/niches/actions";
import {
  addChannelToTrackingAction,
  dismissNotificationAction,
  getActivityFeedAction,
  markNotificationReadAction,
  validateChannelUrlAction,
} from "@/app/(app)/tracking/actions";
import {
  toActivityFeedState,
  type ActivityFeedState,
} from "@/app/(app)/tracking/activity-feed-state";
import { rangeToSince, type TimeRange } from "@/app/(app)/tracking/time-range";
import { err, ok, type Result } from "@/lib/result";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/components/ui/toast-provider";
import { ActivityFeedItem } from "@/components/features/tracking/activity-feed-item";
import {
  AddChannelModal,
  type AddChannelErrorReason,
  type ChannelSearchResultItem,
} from "@/components/features/tracking/add-channel-modal";
import { TrackedChannelsPanel } from "@/components/features/tracking/tracked-channels-panel";
import type { TrackedChannelSummary } from "@/components/features/tracking/types";

export type FeedFilter = "all" | "new_video" | "view_spike" | "cadence_change";

export interface TrackingClientProps {
  initialFilter: FeedFilter;
  initialRange: TimeRange;
  initialState: ActivityFeedState;
  trackedChannels: TrackedChannelSummary[];
}

const FEED_PAGE_SIZE = 20;

const FILTER_CHIPS: { value: FeedFilter; label: string }[] = [
  { value: "all", label: "All activity" },
  { value: "new_video", label: "New videos" },
  { value: "view_spike", label: "View spikes" },
  { value: "cadence_change", label: "Cadence changes" },
];

const RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

function buildTrackingUrl(pathname: string, filter: FeedFilter, range: TimeRange): string {
  const params = new URLSearchParams();
  if (filter !== "all") params.set("filter", filter);
  if (range !== "7d") params.set("range", range);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap items-center gap-1">
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant={value === option.value ? "secondary" : "ghost"}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

// UI-UX-Flow.md §6.1's overview page: activity feed (main column) +
// tracked-channels panel (right, desktop only). Server-rendered initial
// data comes from page.tsx; everything below is the interactive layer --
// filter/range re-fetch, "Load more" pagination, optimistic mark-read, and
// the add-channel modal wired to real Server Actions.
function TrackingClient({
  initialFilter,
  initialRange,
  initialState,
  trackedChannels,
}: TrackingClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  const [filter, setFilter] = React.useState<FeedFilter>(initialFilter);
  const [range, setRange] = React.useState<TimeRange>(initialRange);
  const [state, setState] = React.useState<ActivityFeedState>(initialState);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [activeChannelId, setActiveChannelId] = React.useState<string | null>(null);
  const [showAddChannel, setShowAddChannel] = React.useState(false);

  async function runFeed(nextFilter: FeedFilter, nextRange: TimeRange) {
    setState({ status: "loading" });
    router.replace(buildTrackingUrl(pathname, nextFilter, nextRange));
    const result = await getActivityFeedAction({
      limit: FEED_PAGE_SIZE,
      filter: nextFilter,
      since: rangeToSince(nextRange),
    });
    setState(toActivityFeedState(result));
  }

  function handleFilterChange(next: FeedFilter) {
    setFilter(next);
    void runFeed(next, range);
  }

  function handleRangeChange(next: TimeRange) {
    setRange(next);
    void runFeed(filter, next);
  }

  async function handleLoadMore() {
    if (state.status !== "populated" || !state.nextCursor) return;
    setLoadingMore(true);
    const result = await getActivityFeedAction({
      limit: FEED_PAGE_SIZE,
      filter,
      since: rangeToSince(range),
      cursor: state.nextCursor,
    });
    setLoadingMore(false);
    if (result.ok) {
      setState((current) =>
        current.status === "populated"
          ? {
              status: "populated",
              notifications: [...current.notifications, ...result.value.notifications],
              nextCursor: result.value.nextCursor,
            }
          : current,
      );
    }
  }

  // "unread dot disappearing instantly feels responsive" -- update local
  // state first, fire the Server Action without awaiting it.
  function markReadOptimistic(notificationId: string) {
    setState((current) =>
      current.status === "populated"
        ? {
            ...current,
            notifications: current.notifications.map((n) =>
              n.id === notificationId && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n,
            ),
          }
        : current,
    );
    void markNotificationReadAction(notificationId);
  }

  function handleGoToChannel(notificationId: string, channelId: string) {
    markReadOptimistic(notificationId);
    router.push(`/tracking/${channelId}`);
  }

  function handleDismiss(notificationId: string) {
    setState((current) =>
      current.status === "populated"
        ? {
            ...current,
            notifications: current.notifications.map((n) =>
              n.id === notificationId ? { ...n, dismissedAt: new Date().toISOString() } : n,
            ),
          }
        : current,
    );
    void dismissNotificationAction(notificationId);
  }

  async function handleAddChannel(channelId: string): Promise<Result<void, AddChannelErrorReason>> {
    const result = await addChannelToTrackingAction({ channelId });
    if (result.ok) return ok(undefined);
    return result.error.type === "tier_limit" ? err(result.error) : err({ type: "unknown" });
  }

  // Reuses Niche Finder's own search action (UI-UX-Flow.md §6.5: "same
  // interface as mini Niche Finder") rather than building a separate
  // channel-search path -- this does mean a search from this modal spends
  // a search credit, same as Niche Finder itself.
  async function handleSearch(query: string): Promise<ChannelSearchResultItem[]> {
    const result = await searchNichesAction({ keyword: query }, crypto.randomUUID());
    if (!result.ok) return [];
    return result.value.map((channel) => ({
      channelId: channel.id,
      name: channel.name,
      avatarUrl: channel.avatarUrl,
      subscriberCount: channel.subscriberCount,
    }));
  }

  function handleChannelAdded(channelId: string) {
    setShowAddChannel(false);
    showToast({ title: "Channel added to tracking", variant: "success" });
    router.push(`/tracking/${channelId}`);
  }

  const notifications = state.status === "populated" ? state.notifications : [];
  const displayedNotifications = activeChannelId
    ? notifications.filter((n) => n.channel.id === activeChannelId)
    : notifications;

  return (
    <div className="mx-auto flex max-w-[1440px] gap-6 px-6 py-6 lg:px-10">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ChipGroup
            options={FILTER_CHIPS}
            value={filter}
            onChange={handleFilterChange}
            ariaLabel="Filter activity"
          />
          <div className="flex items-center gap-3">
            <ChipGroup
              options={RANGE_OPTIONS}
              value={range}
              onChange={handleRangeChange}
              ariaLabel="Time range"
            />
            <Button size="sm" onClick={() => setShowAddChannel(true)}>
              Add channel
            </Button>
          </div>
        </div>

        {trackedChannels.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <EmptyState
              icon={<Activity aria-hidden="true" />}
              message="Track channels to see when they post, spike, or change cadence."
              actionLabel="Add channel"
              onAction={() => setShowAddChannel(true)}
            />
            <Link href="/niches" className="text-body-sm text-accent hover:underline">
              Or discover channels in Niche Finder
            </Link>
          </div>
        ) : (
          <>
            {state.status === "loading" ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <LoadingSkeleton key={index} className="h-32 w-full" />
                ))}
              </div>
            ) : null}

            {state.status === "error" ? (
              <ErrorState message={state.message} onRetry={() => void runFeed(filter, range)} />
            ) : null}

            {state.status === "empty" ? (
              <EmptyState message="No activity in this time range." />
            ) : null}

            {state.status === "populated" ? (
              <div className="flex flex-col gap-3">
                {displayedNotifications.length === 0 ? (
                  <EmptyState message="No activity for this channel in this time range." />
                ) : (
                  displayedNotifications.map((notification) => (
                    <ActivityFeedItem
                      key={notification.id}
                      notification={notification}
                      onGoToChannel={() =>
                        handleGoToChannel(notification.id, notification.channel.id)
                      }
                      onDismiss={handleDismiss}
                    />
                  ))
                )}
                {state.nextCursor ? (
                  <Button
                    variant="secondary"
                    loading={loadingMore}
                    onClick={() => void handleLoadMore()}
                    className="self-center"
                  >
                    Load more
                  </Button>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>

      <div className="hidden w-72 shrink-0 lg:block">
        <TrackedChannelsPanel
          channels={trackedChannels}
          activeChannelId={activeChannelId}
          onSelectChannel={setActiveChannelId}
        />
      </div>

      <AddChannelModal
        open={showAddChannel}
        onOpenChange={setShowAddChannel}
        onValidateUrl={validateChannelUrlAction}
        onAddChannel={handleAddChannel}
        onSearch={handleSearch}
        onAdded={handleChannelAdded}
      />
    </div>
  );
}

export { TrackingClient };
