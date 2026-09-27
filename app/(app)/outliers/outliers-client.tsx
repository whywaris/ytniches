"use client";

import * as React from "react";

import { usePathname, useRouter } from "next/navigation";

import { Flame } from "lucide-react";

import { listOutlierFeedAction, listTopOutliersAction } from "@/app/(app)/outliers/actions";
import { toOutlierFeedState, type OutlierFeedState } from "@/app/(app)/outliers/outlier-feed-state";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OutlierCard } from "@/components/features/outliers/outlier-card";
import type { OutlierItem, OutlierRange } from "@/lib/services/outliers";

export type OutlierViewTab = "feed" | "grid" | "trending";

export interface OutliersClientProps {
  initialView: OutlierViewTab;
  initialRange: OutlierRange;
  initialFeedState: OutlierFeedState;
  initialTopItems: OutlierItem[];
}

const FEED_PAGE_SIZE = 20;
const RANGE_OPTIONS: { value: OutlierRange; label: string }[] = [
  { value: 7, label: "7d" },
  { value: 14, label: "14d" },
  { value: 30, label: "30d" },
];

function buildOutliersUrl(pathname: string, view: OutlierViewTab, range: OutlierRange): string {
  const params = new URLSearchParams();
  if (view !== "feed") params.set("view", view);
  if (view === "grid" && range !== 30) params.set("range", String(range));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

// PRD.md §7.1's three Outlier Finder views. Feed is the only one with real
// pagination (chronological, cursor-based, same as /tracking's activity
// feed); Grid and Trending are both bounded top-scoring lists ranked by the
// same live OUTLIER_SCORE (lib/services/outliers.ts), differing only in
// their detected_at window.
function OutliersClient({
  initialView,
  initialRange,
  initialFeedState,
  initialTopItems,
}: OutliersClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [view, setView] = React.useState<OutlierViewTab>(initialView);
  const [range, setRange] = React.useState<OutlierRange>(initialRange);
  const [feedState, setFeedState] = React.useState<OutlierFeedState>(initialFeedState);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [topItems, setTopItems] = React.useState<OutlierItem[]>(initialTopItems);
  const [topLoading, setTopLoading] = React.useState(false);

  async function runFeed() {
    setFeedState({ status: "loading" });
    const result = await listOutlierFeedAction({ limit: FEED_PAGE_SIZE });
    setFeedState(toOutlierFeedState(result));
  }

  async function runTop(nextView: OutlierViewTab, nextRange: OutlierRange) {
    if (nextView === "feed") return;
    setTopLoading(true);
    const items = await listTopOutliersAction({
      view: nextView,
      range: nextView === "grid" ? nextRange : undefined,
    });
    setTopItems(items);
    setTopLoading(false);
  }

  function handleViewChange(next: string) {
    const nextView: OutlierViewTab = next === "grid" || next === "trending" ? next : "feed";
    setView(nextView);
    router.replace(buildOutliersUrl(pathname, nextView, range));
    if (nextView === "feed") {
      void runFeed();
    } else {
      void runTop(nextView, range);
    }
  }

  function handleRangeChange(next: OutlierRange) {
    setRange(next);
    router.replace(buildOutliersUrl(pathname, view, next));
    void runTop("grid", next);
  }

  async function handleLoadMore() {
    if (feedState.status !== "populated" || !feedState.nextCursor) return;
    setLoadingMore(true);
    const result = await listOutlierFeedAction({
      limit: FEED_PAGE_SIZE,
      cursor: feedState.nextCursor,
    });
    setLoadingMore(false);
    if (result.ok) {
      setFeedState((current) =>
        current.status === "populated"
          ? {
              status: "populated",
              items: [...current.items, ...result.value.items],
              nextCursor: result.value.nextCursor,
            }
          : current,
      );
    }
  }

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-6 px-6 py-6 lg:px-10">
      <div>
        <h1 className="text-h3 text-text-primary">Your outliers</h1>
        <p className="text-body-sm text-text-secondary">
          Videos from your tracked channels that dramatically over-perform their baseline.
        </p>
      </div>

      <Tabs value={view} onValueChange={handleViewChange}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          {view === "grid" ? (
            <div role="group" aria-label="Date range" className="flex items-center gap-1">
              {RANGE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={range === option.value ? "secondary" : "ghost"}
                  aria-pressed={range === option.value}
                  onClick={() => handleRangeChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        <TabsContent value="feed" className="flex flex-col gap-3 pt-4">
          {feedState.status === "loading" ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          ) : null}

          {feedState.status === "error" ? (
            <ErrorState message={feedState.message} onRetry={() => void runFeed()} />
          ) : null}

          {feedState.status === "empty" ? (
            <EmptyState
              icon={<Flame aria-hidden="true" />}
              message="No outliers detected yet. Track a few more channels, or check back after the next sync."
            />
          ) : null}

          {feedState.status === "populated" ? (
            <>
              {feedState.items.map((item) => (
                <OutlierCard key={item.id} outlier={item} />
              ))}
              {feedState.nextCursor ? (
                <Button
                  variant="secondary"
                  loading={loadingMore}
                  onClick={() => void handleLoadMore()}
                  className="self-center"
                >
                  Load more
                </Button>
              ) : null}
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="grid" className="flex flex-col gap-3 pt-4">
          {topLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          ) : topItems.length === 0 ? (
            <EmptyState
              icon={<Flame aria-hidden="true" />}
              message="No outliers in this range yet."
            />
          ) : (
            topItems.map((item) => <OutlierCard key={item.id} outlier={item} />)
          )}
        </TabsContent>

        <TabsContent value="trending" className="flex flex-col gap-3 pt-4">
          {topLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-24 w-full" />
              ))}
            </div>
          ) : topItems.length === 0 ? (
            <EmptyState
              icon={<Flame aria-hidden="true" />}
              message="Nothing trending right now -- check back soon."
            />
          ) : (
            topItems.map((item) => <OutlierCard key={item.id} outlier={item} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { OutliersClient };
