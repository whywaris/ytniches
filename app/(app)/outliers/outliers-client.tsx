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
import { EstimateNote } from "@/components/features/youtube/estimate-note";
import {
  DEFAULT_PUBLISHED_WINDOW,
  OUTLIER_PUBLISHED_WINDOWS,
  publishedWindowLabel,
  type OutlierPublishedWindow,
} from "@/lib/outliers/scoring";
import type { OutlierItem } from "@/lib/services/outliers";

export type OutlierViewTab = "feed" | "grid" | "trending";

export interface OutliersClientProps {
  initialView: OutlierViewTab;
  initialPublished: OutlierPublishedWindow;
  initialFeedState: OutlierFeedState;
  initialTopItems: OutlierItem[];
}

const FEED_PAGE_SIZE = 20;
// D-085: filter by when the video was published (not when we detected it).
const PUBLISHED_OPTIONS = OUTLIER_PUBLISHED_WINDOWS.map((value) => ({
  value,
  label: publishedWindowLabel(value),
}));

function buildOutliersUrl(
  pathname: string,
  view: OutlierViewTab,
  published: OutlierPublishedWindow,
): string {
  const params = new URLSearchParams();
  if (view !== "feed") params.set("view", view);
  if (published !== DEFAULT_PUBLISHED_WINDOW) params.set("published", String(published));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

// PRD.md §7.1's three Outlier Finder views. Feed is the only one with real
// pagination (chronological, cursor-based, same as /tracking's activity
// feed); Grid and Trending are both bounded top-scoring lists ranked by the
// same live OUTLIER_SCORE (lib/services/outliers.ts); Trending only covers
// recent detections. The publish-date filter applies to all three.
function OutliersClient({
  initialView,
  initialPublished,
  initialFeedState,
  initialTopItems,
}: OutliersClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [view, setView] = React.useState<OutlierViewTab>(initialView);
  const [published, setPublished] = React.useState<OutlierPublishedWindow>(initialPublished);
  const [feedState, setFeedState] = React.useState<OutlierFeedState>(initialFeedState);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [topItems, setTopItems] = React.useState<OutlierItem[]>(initialTopItems);
  const [topLoading, setTopLoading] = React.useState(false);

  async function runFeed(nextPublished: OutlierPublishedWindow) {
    setFeedState({ status: "loading" });
    const result = await listOutlierFeedAction({ limit: FEED_PAGE_SIZE, published: nextPublished });
    setFeedState(toOutlierFeedState(result));
  }

  async function runTop(nextView: OutlierViewTab, nextPublished: OutlierPublishedWindow) {
    if (nextView === "feed") return;
    setTopLoading(true);
    const items = await listTopOutliersAction({ view: nextView, published: nextPublished });
    setTopItems(items);
    setTopLoading(false);
  }

  function load(nextView: OutlierViewTab, nextPublished: OutlierPublishedWindow) {
    router.replace(buildOutliersUrl(pathname, nextView, nextPublished));
    if (nextView === "feed") {
      void runFeed(nextPublished);
    } else {
      void runTop(nextView, nextPublished);
    }
  }

  function handleViewChange(next: string) {
    const nextView: OutlierViewTab = next === "grid" || next === "trending" ? next : "feed";
    setView(nextView);
    load(nextView, published);
  }

  function handlePublishedChange(next: OutlierPublishedWindow) {
    setPublished(next);
    load(view, next);
  }

  async function handleLoadMore() {
    if (feedState.status !== "populated" || !feedState.nextCursor) return;
    setLoadingMore(true);
    const result = await listOutlierFeedAction({
      limit: FEED_PAGE_SIZE,
      cursor: feedState.nextCursor,
      published,
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
        <EstimateNote what="Outlier multiples and scores" className="mt-1" />
      </div>

      <Tabs value={view} onValueChange={handleViewChange}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          <div role="group" aria-label="Published" className="flex items-center gap-1">
            {PUBLISHED_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant={published === option.value ? "secondary" : "ghost"}
                aria-pressed={published === option.value}
                onClick={() => handlePublishedChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
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
            <ErrorState message={feedState.message} onRetry={() => void runFeed(published)} />
          ) : null}

          {feedState.status === "empty" ? (
            <EmptyState
              icon={<Flame aria-hidden="true" />}
              message={
                published === "all"
                  ? "No outliers detected yet. Track a few more channels, or check back after the next sync."
                  : "No outliers from videos published in this window. Try a longer one."
              }
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
              message="No outliers from videos published in this window yet."
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
