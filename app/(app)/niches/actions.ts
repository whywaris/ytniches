"use server";

import { getRequestContext } from "@/lib/context";
import {
  saveChannelToTracking,
  searchNiches,
  type ChannelSearchResult,
  type SaveChannelError,
  type SearchError,
} from "@/lib/services/channels";
import { NicheSearchInputSchema } from "@/lib/services/channels.schema";
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
