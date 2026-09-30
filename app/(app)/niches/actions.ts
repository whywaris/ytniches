"use server";

import { z } from "zod";

import { getRequestContext } from "@/lib/context";
import {
  saveChannelToTracking,
  searchNiches,
  trackNiche,
  type NotFoundError,
  type TrackNicheResult,
  type ChannelSearchResult,
  type SaveChannelError,
  type SearchError,
} from "@/lib/services/channels";
import { NicheSearchInputSchema } from "@/lib/services/channels.schema";
import {
  channelFiltersToValues,
  nicheFiltersToValues,
  outlierFiltersToValues,
  parseChannelFilters,
  parseNicheFilters,
  parseOutlierFilters,
} from "@/lib/discovery/feed-url";
import { unlockFilteredView, type UnlockResult } from "@/lib/services/feed-credits";
import type { InsufficientCreditsError } from "@/lib/credits";
import { err, type Result } from "@/lib/result";
import { capture } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/server";

export type SearchNichesActionError =
  SearchError | { type: "validation_error"; fields: Record<string, string> };

// Thin per CLAUDE.md's Server Action pattern: validate input, get the
// caller's context, delegate to the service, return its Result untouched.
// No business logic here — that's lib/services/channels.ts.
//
// idempotencyKey is a separate parameter, not part of the Zod-validated
// filters: TRD.md §3.4 says the *client* generates it so a genuine retry of
// the same submit reuses the same key. If it were folded into filters, a
// retry with identical search criteria would look identical either way,
// but keeping it separate makes that contract explicit at the call site.
// "First ever" gate for the first_search/first_save funnel events -- a
// simple post-hoc row count rather than a dedicated flag column. Ceiling:
// a user whose first searches are all cache hits (no credit_events row)
// would re-fire first_search on their first paid one; not worth a schema
// change for an analytics nice-to-have.
async function isFirstEver(
  userId: string,
  table: "credit_events" | "tracked_channels",
  filter?: { column: string; value: string },
): Promise<boolean> {
  const supabase = await createClient();
  let query = supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (filter) {
    query = query.eq(filter.column, filter.value);
  }
  const { count } = await query;
  return (count ?? 0) <= 1;
}

export async function searchNichesAction(
  input: unknown,
  idempotencyKey: string,
): Promise<Result<ChannelSearchResult[], SearchNichesActionError>> {
  const parsed = NicheSearchInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const fields: Record<string, string> = {};
    for (const [field, messages] of Object.entries(fieldErrors)) {
      if (messages?.[0]) {
        fields[field] = messages[0];
      }
    }
    return err({ type: "validation_error", fields });
  }

  const ctx = await getRequestContext();
  const result = await searchNiches(ctx, parsed.data, idempotencyKey);
  if (
    result.ok &&
    (await isFirstEver(ctx.userId, "credit_events", { column: "reason", value: "Niche search" }))
  ) {
    void capture("first_search", { distinctId: ctx.userId });
  }
  return result;
}

export async function saveChannelAction(
  channelId: string,
): Promise<Result<void, SaveChannelError>> {
  const ctx = await getRequestContext();
  const result = await saveChannelToTracking(ctx, channelId);
  if (result.ok && (await isFirstEver(ctx.userId, "tracked_channels"))) {
    void capture("first_save", { distinctId: ctx.userId });
  }
  return result;
}

const SlugSchema = z.string().regex(/^[a-z0-9-]{1,80}$/);

// Niche-Discovery-Engine.md §9.2/§9.5: "Track" on a niche card or page.
export async function trackNicheAction(
  slug: unknown,
): Promise<Result<TrackNicheResult, NotFoundError | { type: "validation_error" }>> {
  const parsed = SlugSchema.safeParse(slug);
  if (!parsed.success) return err({ type: "validation_error" });
  const ctx = await getRequestContext();
  return trackNiche(ctx, parsed.data);
}

const FeedTabSchema = z.enum(["niches", "channels", "outliers"]);
const FilterValuesSchema = z.record(z.string(), z.string().max(100));

// Re-parse through the same URL parsers the page uses, so the unlock is
// keyed on exactly the filters the page will check (junk params dropped).
function canonicalValues(
  tab: z.infer<typeof FeedTabSchema>,
  raw: Record<string, string>,
): Record<string, string | undefined> {
  switch (tab) {
    case "niches":
      return nicheFiltersToValues(parseNicheFilters(raw));
    case "channels":
      return channelFiltersToValues(parseChannelFilters(raw));
    case "outliers":
      return outlierFiltersToValues(parseOutlierFilters(raw));
  }
}

// D-072: a filtered discovery view costs 1 credit, then it's free to re-run
// or page for 24h. Same client-generated idempotency key contract as
// searchNichesAction.
export async function unlockFeedFiltersAction(
  tab: unknown,
  values: unknown,
  idempotencyKey: string,
): Promise<Result<UnlockResult, InsufficientCreditsError | { type: "validation_error" }>> {
  const parsedTab = FeedTabSchema.safeParse(tab);
  const parsedValues = FilterValuesSchema.safeParse(values);
  const parsedKey = z.string().uuid().safeParse(idempotencyKey);
  if (!parsedTab.success || !parsedValues.success || !parsedKey.success) {
    return err({ type: "validation_error" });
  }
  const ctx = await getRequestContext();
  return unlockFilteredView(
    ctx,
    parsedTab.data,
    canonicalValues(parsedTab.data, parsedValues.data),
    parsedKey.data,
  );
}
