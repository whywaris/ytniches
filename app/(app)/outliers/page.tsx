import { getRequestContext } from "@/lib/context";
import {
  DEFAULT_PUBLISHED_WINDOW,
  listOutlierFeed,
  listTopOutliers,
} from "@/lib/services/outliers";
import { toOutlierFeedState } from "@/app/(app)/outliers/outlier-feed-state";
import { OutliersClient, type OutlierViewTab } from "@/app/(app)/outliers/outliers-client";
import type { OutlierPublishedWindow } from "@/lib/services/outliers";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your outliers — YTNiches",
};

const FEED_PAGE_SIZE = 20;

function parseView(raw: string | undefined): OutlierViewTab {
  return raw === "grid" || raw === "trending" ? raw : "feed";
}

// D-085: ?published=90 or ?published=all; anything else is the default.
function parsePublished(raw: string | undefined): OutlierPublishedWindow {
  return raw === "90" ? 90 : raw === "all" ? "all" : DEFAULT_PUBLISHED_WINDOW;
}

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

// PRD.md §7.1. Same server/client split as tracking/page.tsx: the first
// paint of a shared/bookmarked view+published combination is server-rendered
// straight from the URL, the interactive layer (tab switching, publish filter,
// "load more") lives in outliers-client.tsx.
export default async function OutliersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const view = parseView(getParam(params, "view"));
  const published = parsePublished(getParam(params, "published"));

  const ctx = await getRequestContext();

  if (view !== "feed") {
    const items = await listTopOutliers(ctx, { view, published });
    return (
      <OutliersClient
        initialView={view}
        initialPublished={published}
        initialFeedState={{ status: "empty" }}
        initialTopItems={items}
      />
    );
  }

  const feedResult = await listOutlierFeed(ctx, { limit: FEED_PAGE_SIZE, published });
  return (
    <OutliersClient
      initialView={view}
      initialPublished={published}
      initialFeedState={toOutlierFeedState(feedResult)}
      initialTopItems={[]}
    />
  );
}
