import type { ChannelSearchResult } from "@/lib/services/channels";

// Shared shape for every Niche Finder display component (card, table,
// comparison) — a UI-layer name for the service's result type, decoupled
// from lib/services/ so a future UI-only field doesn't have to leak into
// the service layer. ChannelSearchResult already carries viewTrend (added
// for the grid card's sparkline, UI-UX-Flow.md §5.2).
export type NicheChannelResult = ChannelSearchResult;

export type NicheFinderView = "grid" | "list" | "comparison";
