import { getRequestContext } from "@/lib/context";
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

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Niche Finder — YTNiches",
};

// UI-UX-Flow.md §5.1-5.2. A Server Component so the first paint of an
// already-shared/bookmarked search (?q=...&subs=...) is server-rendered
// straight from the URL (Application-Flow.md §2.5) — the page itself never
// needs "use client"; only the interactive layer below it does.
export default async function NichesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseFiltersFromSearchParams(params);
  const sort = parseSort(params);
  const page = parsePage(params);

  if (!hasAnyFilterParam(params)) {
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

  const ctx = await getRequestContext();
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
