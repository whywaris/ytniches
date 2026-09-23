"use server";

import { getRequestContext } from "@/lib/context";
import {
  createEntry,
  deleteEntry,
  listEntries,
  moveEntry,
  updateEntry,
  type CalendarEntry,
  type NotContributorError,
  type NotFoundError,
  type NotWorkspaceMemberError,
} from "@/lib/services/calendar";
import {
  CreateCalendarEntryInputSchema,
  ListCalendarEntriesFilterSchema,
  UpdateCalendarEntryInputSchema,
} from "@/lib/services/calendar.schema";
import { err, type Result } from "@/lib/result";

export type ValidationError = { type: "validation_error"; fields: Record<string, string> };

function toValidationError(fieldErrors: Record<string, string[] | undefined>): ValidationError {
  const fields: Record<string, string> = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) fields[field] = messages[0];
  }
  return { type: "validation_error", fields };
}

// Thin per CLAUDE.md's Server Action pattern. listEntriesAction takes no
// ctx-derived data of its own (RLS scopes visibility), so it's not
// gated beyond a valid filter shape.

export async function listEntriesAction(
  workspaceId: string,
  filter: unknown,
): Promise<Result<CalendarEntry[], ValidationError>> {
  const parsed = ListCalendarEntriesFilterSchema.safeParse(filter);
  if (!parsed.success) {
    return err(toValidationError(parsed.error.flatten().fieldErrors));
  }
  return { ok: true, value: await listEntries(workspaceId, parsed.data) };
}

export async function createEntryAction(
  workspaceId: string,
  input: unknown,
): Promise<Result<CalendarEntry, NotContributorError | NotWorkspaceMemberError | ValidationError>> {
  const parsed = CreateCalendarEntryInputSchema.safeParse(input);
  if (!parsed.success) {
    return err(toValidationError(parsed.error.flatten().fieldErrors));
  }
  const ctx = await getRequestContext();
  return createEntry(ctx, workspaceId, parsed.data);
}

export async function updateEntryAction(
  entryId: string,
  input: unknown,
): Promise<
  Result<void, NotContributorError | NotFoundError | NotWorkspaceMemberError | ValidationError>
> {
  const parsed = UpdateCalendarEntryInputSchema.safeParse(input);
  if (!parsed.success) {
    return err(toValidationError(parsed.error.flatten().fieldErrors));
  }
  const ctx = await getRequestContext();
  return updateEntry(ctx, entryId, parsed.data);
}

export async function moveEntryAction(
  entryId: string,
  scheduledFor: string,
): Promise<Result<void, NotContributorError | NotFoundError | NotWorkspaceMemberError>> {
  const ctx = await getRequestContext();
  return moveEntry(ctx, entryId, scheduledFor);
}

export async function deleteEntryAction(
  entryId: string,
): Promise<Result<void, NotContributorError | NotFoundError>> {
  const ctx = await getRequestContext();
  return deleteEntry(ctx, entryId);
}
