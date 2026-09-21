import type { ChannelSearchResult, SearchError } from "@/lib/services/channels";
import type { Result } from "@/lib/result";

// Application-Flow.md §4.1 Niche Finder state machine:
// idle -> searching -> results | empty | error | rate_limited
// results/empty -> searching (change filters); error -> searching (retry)
// rate_limited -> [*] (upgrade or wait). insufficient_credits/quota_exhausted
// aren't in the original diagram but map onto the same "terminal until the
// user acts" shape as rate_limited.
export type SearchState =
  | { status: "idle" }
  | { status: "searching" }
  | { status: "results"; data: ChannelSearchResult[] }
  | { status: "empty" }
  | { status: "error"; message: string }
  | { status: "rate_limited"; retryAfterSeconds: number }
  | { status: "insufficient_credits"; balance: number; required: number }
  | { status: "quota_exhausted" };

// Shared between page.tsx (mapping a direct searchNiches() service call,
// server-side, on first load) and niche-finder-client.tsx (mapping a
// searchNichesAction() call after a client-side search) so the state
// machine has exactly one definition of what each error becomes.
export type SearchActionError =
  SearchError | { type: "validation_error"; fields: Record<string, string> };

export function toSearchState(
  result: Result<ChannelSearchResult[], SearchActionError>,
): SearchState {
  if (!result.ok) {
    switch (result.error.type) {
      case "rate_limited":
        return { status: "rate_limited", retryAfterSeconds: result.error.retryAfterSeconds };
      case "insufficient_credits":
        return {
          status: "insufficient_credits",
          balance: result.error.balance,
          required: result.error.required,
        };
      case "quota_exhausted":
        return { status: "quota_exhausted" };
      case "youtube_error":
        return { status: "error", message: result.error.message };
      case "validation_error":
        return {
          status: "error",
          message: "Some filters were invalid. Adjust them and try again.",
        };
      default:
        return { status: "error", message: "Something went wrong loading channels." };
    }
  }
  return result.value.length === 0
    ? { status: "empty" }
    : { status: "results", data: result.value };
}
