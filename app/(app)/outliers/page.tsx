import { getRequestContext } from "@/lib/context";
import { listOutlierFeed, listTopOutliers } from "@/lib/services/outliers";
import { toOutlierFeedState } from "@/app/(app)/outliers/outlier-feed-state";
import { OutliersClient, type OutlierViewTab } from "@/app/(app)/outliers/outliers-client";
import type { OutlierRange } from "@/lib/services/outliers";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your outliers — YTNiches",
};

const FEED_PAGE_SIZE = 20;

function parseView(raw: string | undefined): OutlierViewTab {
  return raw === "grid" || raw === "trending" ? raw : "feed";
}

function parseRange(raw: string | undefined): OutlierRange {
  return raw === "7" ? 7 : raw === "14" ? 14 : 30;
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

// PRD.md §7.1. Same server/client split as tracking/page.tsx: the first
// paint of a shared/bookmarked view+range combination is server-rendered
// straight from the URL, the interactive layer (tab switching, range,
// "load more") lives in outliers-client.tsx.
export default async function OutliersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const view = parseView(getParam(params, "view"));
  const range = parseRange(getParam(params, "range"));

  const ctx = await getRequestContext();

  if (view !== "feed") {
    const items = await listTopOutliers(ctx, { view, range: view === "grid" ? range : undefined });
    return (
      <OutliersClient
        initialView={view}
        initialRange={range}
        initialFeedState={{ status: "empty" }}
        initialTopItems={items}
      />
    );
  }

  const feedResult = await listOutlierFeed(ctx, { limit: FEED_PAGE_SIZE });
  return (
    <OutliersClient
      initialView={view}
      initialRange={range}
      initialFeedState={toOutlierFeedState(feedResult)}
      initialTopItems={[]}
    />
  );
}
