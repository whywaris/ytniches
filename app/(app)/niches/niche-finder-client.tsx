"use client";

import * as React from "react";

import { usePathname, useRouter } from "next/navigation";

import { Search as SearchIcon } from "lucide-react";

import { readLocalStorage, writeLocalStorage } from "@/lib/local-storage";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { Select } from "@/components/ui/select";
import { ChannelCard } from "@/components/features/niche-finder/channel-card";
import { ChannelTable } from "@/components/features/niche-finder/channel-table";
import { ComparisonView } from "@/components/features/niche-finder/comparison-view";
import {
  DEFAULT_FILTER_VALUES,
  FilterPanel,
  type NicheFilterValues,
} from "@/components/features/niche-finder/filter-panel";
import { ViewToggle } from "@/components/features/niche-finder/view-toggle";
import { buildSearchUrl, toSearchInput } from "@/app/(app)/niches/url-filters";
import { saveChannelAction, searchNichesAction } from "@/app/(app)/niches/actions";
import { toSearchState, type SearchState } from "@/app/(app)/niches/search-state";
import type { NicheChannelResult, NicheFinderView } from "@/components/features/niche-finder/types";
import type { NicheSearchInput } from "@/lib/services/channels.schema";
import type { SaveChannelError } from "@/lib/services/channels";

export interface NicheFinderClientProps {
  initialFilters: NicheFilterValues;
  initialSort: NicheSearchInput["sort"];
  initialPage: number;
  initialState: SearchState;
}

const VIEW_STORAGE_KEY = "ytniches:niche-finder-view";
// Deliberately duplicated, not imported, from lib/services/channels.ts's
// own RESULTS_PER_PAGE: that module is server-only (service-role client,
// env vars) and importing any value from it here would pull it into the
// client bundle. Must stay in sync with that constant by hand.
const RESULTS_PER_PAGE = 20;

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "subscribers", label: "Subscriber count" },
  { value: "avg_views", label: "Avg views" },
  { value: "upload_freq", label: "Upload frequency" },
];

const EXAMPLE_SEARCHES: { label: string; values: Partial<NicheFilterValues> }[] = [
  {
    label: "Sleep music, 10k–100k subs",
    values: { keyword: "sleep music", subscribersMin: "10000", subscribersMax: "100000" },
  },
  { label: "AI history, monetized", values: { keyword: "AI history", monetized: "yes" } },
  {
    label: "Faceless facts, weekly uploads",
    values: { keyword: "faceless facts", uploadFrequency: "weekly" },
  },
];

function NicheFinderClient({
  initialFilters,
  initialSort,
  initialPage,
  initialState,
}: NicheFinderClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [filters, setFilters] = React.useState<NicheFilterValues>(initialFilters);
  const [sort, setSort] = React.useState<NicheSearchInput["sort"]>(initialSort);
  const [page, setPage] = React.useState(initialPage);
  const [state, setState] = React.useState<SearchState>(initialState);
  const [view, setView] = React.useState<NicheFinderView>("grid");
  // Session-local only: no "list my tracked channel ids" lookup exists yet
  // (that's Competitor Tracking, Task 2) — a channel saved in a *previous*
  // session will still show as unsaved here until that ships.
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());
  const [saveError, setSaveError] = React.useState<SaveChannelError | null>(null);
  const [selectedForComparison, setSelectedForComparison] = React.useState<NicheChannelResult[]>(
    [],
  );

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from an external system (localStorage) post-mount, same pattern as Sidebar/ChannelTable
    setView(
      readLocalStorage<NicheFinderView>(VIEW_STORAGE_KEY, "grid", (raw) =>
        raw === "list" || raw === "comparison" ? raw : "grid",
      ),
    );
  }, []);

  function changeView(next: NicheFinderView) {
    setView(next);
    writeLocalStorage(VIEW_STORAGE_KEY, next);
  }

  async function runSearch(
    nextFilters: NicheFilterValues,
    nextSort: NicheSearchInput["sort"],
    nextPage: number,
  ) {
    setState({ status: "searching" });
    setSelectedForComparison([]);
    // D-069: search is a tab of /niches now; keep the URL on it.
    const url = buildSearchUrl(pathname, nextFilters, nextSort, nextPage);
    router.replace(`${url}${url.includes("?") ? "&" : "?"}tab=search`);
    const idempotencyKey = crypto.randomUUID();
    const result = await searchNichesAction(
      toSearchInput(nextFilters, nextSort, nextPage),
      idempotencyKey,
    );
    setState(toSearchState(result));
  }

  function handleSearch() {
    setPage(1);
    void runSearch(filters, sort, 1);
  }

  function handleReset() {
    setFilters(DEFAULT_FILTER_VALUES);
  }

  function handleSortChange(nextSort: string) {
    setSort(nextSort as NicheSearchInput["sort"]);
    void runSearch(filters, nextSort as NicheSearchInput["sort"], 1);
    setPage(1);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    void runSearch(filters, sort, nextPage);
  }

  function handleExampleClick(example: Partial<NicheFilterValues>) {
    const next = { ...DEFAULT_FILTER_VALUES, ...example };
    setFilters(next);
    setPage(1);
    void runSearch(next, "relevance", 1);
  }

  async function handleSave(channelId: string) {
    setSaveError(null);
    const result = await saveChannelAction(channelId);
    if (result.ok) {
      setSavedIds((current) => new Set(current).add(channelId));
    } else {
      setSaveError(result.error);
    }
  }

  function handleOpen(channelId: string) {
    router.push(`/niches/channels/${channelId}`);
  }

  const results = state.status === "results" ? state.data : [];

  return (
    <div className="mx-auto flex max-w-[1440px] gap-6 px-6 py-6 lg:px-10">
      <div className="w-80 shrink-0">
        <FilterPanel
          values={filters}
          onChange={setFilters}
          onSearch={handleSearch}
          onReset={handleReset}
        />
      </div>

      <div className="min-w-0 flex-1">
        {saveError ? (
          <div
            role="alert"
            className="mb-4 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-body-sm text-warning"
          >
            You&apos;re at {saveError.current}/{saveError.limit} tracked channels. Upgrade to track
            more.
          </div>
        ) : null}

        {state.status === "idle" ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <SearchIcon className="size-10 text-text-tertiary" aria-hidden="true" />
            <p className="text-body text-text-secondary">Set your filters and hit Search.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLE_SEARCHES.map((example) => (
                <Button
                  key={example.label}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleExampleClick(example.values)}
                >
                  {example.label}
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {state.status === "rate_limited" ? (
          <div
            role="alert"
            className="mb-4 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-body-sm text-warning"
          >
            You&apos;ve hit today&apos;s search limit. Try again in {state.retryAfterSeconds}s, or
            upgrade for more.
          </div>
        ) : null}

        {state.status === "insufficient_credits" || state.status === "quota_exhausted" ? (
          <div className="mb-4 flex items-center justify-between rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-body-sm text-warning">
            <span>
              {state.status === "insufficient_credits"
                ? `Not enough credits (${state.balance} left, ${state.required} needed).`
                : "Service is busy right now — try again shortly."}
            </span>
            <Button size="sm" variant="secondary" asChild>
              <a href="/settings/billing">Upgrade</a>
            </Button>
          </div>
        ) : null}

        {state.status === "searching" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-40 w-full" />
            ))}
          </div>
        ) : null}

        {state.status === "error" ? (
          <ErrorState message={state.message} onRetry={() => void runSearch(filters, sort, page)} />
        ) : null}

        {state.status === "empty" ? (
          <EmptyState message="No channels matched yet — results improve as the cache warms. Try broadening your filters." />
        ) : null}

        {state.status === "results" ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-body-sm text-text-secondary">{results.length} channels</span>
              <div className="flex items-center gap-2">
                <Select
                  options={SORT_OPTIONS}
                  value={sort}
                  onValueChange={handleSortChange}
                  className="w-44"
                />
                <ViewToggle
                  value={view}
                  onValueChange={changeView}
                  comparisonDisabled={
                    selectedForComparison.length < 2 || selectedForComparison.length > 3
                  }
                />
              </div>
            </div>

            {view === "grid" ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    saved={savedIds.has(channel.id)}
                    onSave={handleSave}
                    onOpen={handleOpen}
                  />
                ))}
              </div>
            ) : null}

            {view === "list" ? (
              <ChannelTable
                channels={results}
                savedChannelIds={savedIds}
                onSave={handleSave}
                onOpen={handleOpen}
                onSelectionChange={setSelectedForComparison}
                renderBulkActions={(selected, clear) => (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        selected.forEach((channel) => void handleSave(channel.id));
                        clear();
                      }}
                    >
                      Save {selected.length} to tracking
                    </Button>
                  </>
                )}
              />
            ) : null}

            {view === "comparison" ? (
              <ComparisonView
                channels={selectedForComparison}
                onRemove={(channelId) =>
                  setSelectedForComparison((current) =>
                    current.filter((channel) => channel.id !== channelId),
                  )
                }
              />
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </Button>
              <span className="text-body-sm text-text-secondary">Page {page}</span>
              <Button
                variant="ghost"
                size="sm"
                disabled={results.length < RESULTS_PER_PAGE}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export { NicheFinderClient };
