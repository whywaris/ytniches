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
  return searchNiches(ctx, parsed.data, idempotencyKey);
}

export async function saveChannelAction(
  channelId: string,
): Promise<Result<void, SaveChannelError>> {
  const ctx = await getRequestContext();
  return saveChannelToTracking(ctx, channelId);
}
