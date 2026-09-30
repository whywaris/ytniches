// Monetization.md §3.1 credit costs and §3.6 fair-use limits, as the
// product actually charges them. One source: the services charge these,
// and the help center shows them (<Fact>), so they can't disagree.
export const CREDIT_COSTS = {
  nicheSearch: 1,
  // D-072: a filtered view of the discovery feeds (default feeds, sort,
  // page and a niche-only filter stay free). Re-running or paging the same
  // filters is free for SEARCH_RESULTS_CACHE_HOURS.
  filteredFeedSearch: 1,
  // Free on purpose: the tracked-channel cap limits abuse (Monetization.md
  // §3.1 lists 1 credit -- logged as a spec gap).
  trackChannel: 0,
  promptGenerate: 5,
  promptRegenerate: 3,
  thumbnailIdeas: 5,
  // Thumbnail ideas have no feedback step, so a regeneration is a full run.
  thumbnailIdeasRegenerate: 5,
} as const;

// D-065: a Niche Finder search's results are kept this long. Paging,
// re-sorting or re-running the same search within it is free: no credit,
// no YouTube quota.
export const SEARCH_RESULTS_CACHE_HOURS = 24;

export const FAIR_USE = {
  nicheSearchesPerHour: 60,
} as const;
