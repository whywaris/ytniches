import { createClient } from "@/lib/supabase/server";
import { err, ok, type Result } from "@/lib/result";
import type { RequestContext } from "@/lib/context";
import type { Database } from "@/lib/supabase/database.types";
import { EXPIRED_CHANNEL_NAME } from "@/lib/youtube/retention";
import type {
  CreateCalendarEntryInput,
  ListCalendarEntriesFilter,
  UpdateCalendarEntryInput,
} from "@/lib/services/calendar.schema";

export type CalendarStatus = Database["public"]["Enums"]["calendar_status"];

export interface CalendarEntry {
  id: string;
  workspaceId: string;
  userId: string;
  channelId: string | null;
  channelName: string | null;
  title: string;
  description: string | null;
  linkedPrompts: string[];
  status: CalendarStatus;
  scheduledFor: string | null;
  assigneeId: string | null;
}

export type NotContributorError = { type: "not_contributor" };
export type NotFoundError = { type: "not_found" };
export type NotWorkspaceMemberError = { type: "assignee_not_member" };

type CalendarEntryRow = Database["public"]["Tables"]["calendar_entries"]["Row"];

async function isWorkspaceMember(workspaceId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    throw new Error(`isWorkspaceMember query failed: ${error.message}`);
  }
  return data !== null;
}

// Backend-Schema.md §5.7: "viewer" is read-only for the calendar too --
// same pre-check pattern as lib/services/tasks.ts's requireContributor.
async function requireContributor(
  ctx: RequestContext,
  workspaceId: string,
): Promise<Result<true, NotContributorError>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", ctx.userId)
    .maybeSingle();
  if (error) {
    throw new Error(`requireContributor query failed: ${error.message}`);
  }
  return data && (data.role === "admin" || data.role === "editor")
    ? ok(true)
    : err({ type: "not_contributor" });
}

function toEntry(row: CalendarEntryRow, channelName: string | null): CalendarEntry {
  return {
    id: row.id,
    workspaceId: row.workspace_id ?? "",
    userId: row.user_id,
    channelId: row.channel_id,
    channelName,
    title: row.title,
    description: row.description,
    linkedPrompts: row.linked_prompts,
    status: row.status,
    scheduledFor: row.scheduled_for,
    assigneeId: row.assignee_id,
  };
}

async function attachChannelNames(rows: CalendarEntryRow[]): Promise<CalendarEntry[]> {
  const channelIds = [
    ...new Set(rows.map((r) => r.channel_id).filter((id): id is string => id !== null)),
  ];
  if (channelIds.length === 0) {
    return rows.map((row) => toEntry(row, null));
  }
  const supabase = await createClient();
  const { data: channels, error } = await supabase
    .from("channels")
    .select("id, name")
    .in("id", channelIds);
  if (error) {
    throw new Error(`attachChannelNames query failed: ${error.message}`);
  }
  // The 30-day purge empties (never deletes) a channel a calendar entry
  // points at, leaving name = '' -- show that as expired, not blank (D-073).
  const nameById = new Map((channels ?? []).map((c) => [c.id, c.name || EXPIRED_CHANNEL_NAME]));
  return rows.map((row) =>
    toEntry(row, row.channel_id ? (nameById.get(row.channel_id) ?? null) : null),
  );
}

export async function createEntry(
  ctx: RequestContext,
  workspaceId: string,
  input: CreateCalendarEntryInput,
): Promise<Result<CalendarEntry, NotContributorError | NotWorkspaceMemberError>> {
  const contributorCheck = await requireContributor(ctx, workspaceId);
  if (!contributorCheck.ok) return contributorCheck;

  if (input.assigneeId && !(await isWorkspaceMember(workspaceId, input.assigneeId))) {
    return err({ type: "assignee_not_member" });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_entries")
    .insert({
      workspace_id: workspaceId,
      user_id: ctx.userId,
      channel_id: input.channelId ?? null,
      title: input.title,
      description: input.description ?? null,
      linked_prompts: input.linkedPrompts ?? [],
      status: input.status ?? "idea",
      scheduled_for: input.scheduledFor ?? null,
      assignee_id: input.assigneeId ?? null,
    })
    .select("*")
    .single();
  if (error) {
    throw new Error(`createEntry insert failed: ${error.message}`);
  }

  const [entry] = await attachChannelNames([data]);
  return ok(entry);
}

export async function listEntries(
  workspaceId: string,
  filter: ListCalendarEntriesFilter,
): Promise<CalendarEntry[]> {
  const supabase = await createClient();
  let query = supabase
    .from("calendar_entries")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("scheduled_for", { ascending: true, nullsFirst: false });

  if (filter.status) query = query.eq("status", filter.status);
  if (filter.assigneeId) query = query.eq("assignee_id", filter.assigneeId);
  if (filter.channelId) query = query.eq("channel_id", filter.channelId);
  if (filter.from) query = query.gte("scheduled_for", filter.from);
  if (filter.to) query = query.lte("scheduled_for", filter.to);

  const { data, error } = await query;
  if (error) {
    throw new Error(`listEntries query failed: ${error.message}`);
  }
  return attachChannelNames(data ?? []);
}

// Dashboard next-step card: "has this workspace planned anything yet".
export async function getCalendarEntryCount(workspaceId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("calendar_entries")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null);
  if (error) {
    throw new Error(`getCalendarEntryCount query failed: ${error.message}`);
  }
  return count ?? 0;
}

async function getEntryWorkspaceId(entryId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calendar_entries")
    .select("workspace_id")
    .eq("id", entryId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) {
    throw new Error(`getEntryWorkspaceId query failed: ${error.message}`);
  }
  return data?.workspace_id ?? null;
}

export async function updateEntry(
  ctx: RequestContext,
  entryId: string,
  input: UpdateCalendarEntryInput,
): Promise<Result<void, NotContributorError | NotFoundError | NotWorkspaceMemberError>> {
  const workspaceId = await getEntryWorkspaceId(entryId);
  if (!workspaceId) return err({ type: "not_found" });

  const contributorCheck = await requireContributor(ctx, workspaceId);
  if (!contributorCheck.ok) return contributorCheck;

  if (input.assigneeId && !(await isWorkspaceMember(workspaceId, input.assigneeId))) {
    return err({ type: "assignee_not_member" });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("calendar_entries")
    .update({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.channelId !== undefined && { channel_id: input.channelId }),
      ...(input.linkedPrompts !== undefined && { linked_prompts: input.linkedPrompts }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.scheduledFor !== undefined && { scheduled_for: input.scheduledFor }),
      ...(input.assigneeId !== undefined && { assignee_id: input.assigneeId }),
    })
    .eq("id", entryId);
  if (error) {
    throw new Error(`updateEntry update failed: ${error.message}`);
  }
  return ok(undefined);
}

// Drag-and-drop reschedule -- a thin wrapper over updateEntry so the
// client's drop handler doesn't need to build a whole UpdateCalendarEntryInput
// for what's conceptually a single-field move.
export async function moveEntry(
  ctx: RequestContext,
  entryId: string,
  scheduledFor: string,
): Promise<Result<void, NotContributorError | NotFoundError | NotWorkspaceMemberError>> {
  return updateEntry(ctx, entryId, { scheduledFor });
}

// Backend-Schema.md §1.3 soft-delete, same pattern as deleteTask.
export async function deleteEntry(
  ctx: RequestContext,
  entryId: string,
): Promise<Result<void, NotContributorError | NotFoundError>> {
  const workspaceId = await getEntryWorkspaceId(entryId);
  if (!workspaceId) return err({ type: "not_found" });

  const contributorCheck = await requireContributor(ctx, workspaceId);
  if (!contributorCheck.ok) return contributorCheck;

  const supabase = await createClient();
  const { error } = await supabase
    .from("calendar_entries")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", entryId);
  if (error) {
    throw new Error(`deleteEntry update failed: ${error.message}`);
  }
  return ok(undefined);
}
