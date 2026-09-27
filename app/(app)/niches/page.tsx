import { getRequestContext, type RequestContext } from "@/lib/context";
import {
  parseChannelFilters,
  parseNicheFilters,
  parseOutlierFilters,
  parseTab,
  type FeedTab,
  type SearchParams,
} from "@/lib/discovery/feed-url";
import { getFeedFreshness } from "@/lib/services/niche-feed";
import { searchNiches } from "@/lib/services/channels";
import { NicheSearchInputSchema } from "@/lib/services/channels.schema";
import {
  hasAnyFilterParam,
  parseFiltersFromSearchParams,
  parsePage,
  parseSort,
  toSearchInput,
} from "@/app/(app)/niches/url-filters";
import { NicheFinderClient } from "@/app/(app)/niches/niche-finder-client";
import { toSearchState } from "@/app/(app)/niches/search-state";
import { ChannelsSection, NichesSection, OutliersSection } from "@/app/(app)/niches/feed-sections";
import { FeedTabs } from "@/components/features/niche-finder/feed-tabs";
import { FreshnessLine } from "@/components/features/niche-finder/freshness-line";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Niche Finder — YTNiches",
};

const TAB_HREFS: Record<FeedTab, string> = {
  niches: "/niches",
  channels: "/niches?tab=channels",
  outliers: "/niches?tab=outliers",
  search: "/niches?tab=search",
};

// Niche-Discovery-Engine.md §9.1 (D-069): /niches opens on the browse feed;
// the live search (UI-UX-Flow.md §5.1-5.4) is the Search tab. Old
// /niches?q=... links still land on Search, but pre-filled, not auto-run:
// a paid search only runs on load for an explicit tab=search URL.
export default async function NichesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const explicitTab = parseTab(params);
  const tab: FeedTab = explicitTab ?? (hasAnyFilterParam(params) ? "search" : "niches");
  const [ctx, freshness] = await Promise.all([getRequestContext(), getFeedFreshness()]);

  return (
    <div className="space-y-3">
      <FreshnessLine
        updatedAt={freshness.updatedAt}
        newChannelsThisWeek={freshness.newChannelsThisWeek}
      />
      <FeedTabs active={tab} hrefs={TAB_HREFS}>
        <TabBody tab={tab} ctx={ctx} params={params} autoSearch={explicitTab === "search"} />
      </FeedTabs>
    </div>
  );
}

async function TabBody({
  tab,
  ctx,
  params,
  autoSearch,
}: {
  tab: FeedTab;
  ctx: RequestContext;
  params: SearchParams;
  autoSearch: boolean;
}) {
  switch (tab) {
    case "niches":
      return <NichesSection ctx={ctx} filters={parseNicheFilters(params)} />;
    case "channels":
      return <ChannelsSection ctx={ctx} filters={parseChannelFilters(params)} />;
    case "outliers":
      return <OutliersSection ctx={ctx} filters={parseOutlierFilters(params)} />;
    case "search":
      return <SearchSection ctx={ctx} params={params} autoSearch={autoSearch} />;
  }
}

// UI-UX-Flow.md §5.1-5.2. Server-rendered so the first paint of a shared
// search URL comes straight from the URL (Application-Flow.md §2.5).
async function SearchSection({
  ctx,
  params,
  autoSearch,
}: {
  ctx: RequestContext;
  params: SearchParams;
  autoSearch: boolean;
}) {
  const filters = parseFiltersFromSearchParams(params);
  const sort = parseSort(params);
  const page = parsePage(params);

  if (!autoSearch || !hasAnyFilterParam(params)) {
    return (
      <NicheFinderClient
        initialFilters={filters}
        initialSort={sort}
        initialPage={page}
        initialState={{ status: "idle" }}
      />
    );
  }

  const parsedInput = NicheSearchInputSchema.safeParse(toSearchInput(filters, sort, page));
  if (!parsedInput.success) {
    // Malformed/hand-edited URL — fall back to the pre-search state rather
    // than crashing the page over query-param corruption.
    return (
      <NicheFinderClient
        initialFilters={filters}
        initialSort={sort}
        initialPage={page}
        initialState={{ status: "idle" }}
      />
    );
  }

  const idempotencyKey = crypto.randomUUID();
  const result = await searchNiches(ctx, parsedInput.data, idempotencyKey);

  return (
    <NicheFinderClient
      initialFilters={filters}
      initialSort={sort}
      initialPage={page}
      initialState={toSearchState(result)}
    />
  );
}
