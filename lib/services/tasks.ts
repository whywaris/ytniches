import { createClient } from "@/lib/supabase/server";
import { err, ok, type Result } from "@/lib/result";
import type { RequestContext } from "@/lib/context";
import type { Database } from "@/lib/supabase/database.types";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/services/tasks.schema";

export type TaskStatus = Database["public"]["Enums"]["task_status"];
export type TaskLinkedType = "channel" | "prompt" | "calendar_entry";

export interface Task {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  dueDate: string | null;
  status: TaskStatus;
  linkedType: TaskLinkedType | null;
  linkedId: string | null;
  createdBy: string;
  createdAt: string;
}

export interface TaskFilter {
  view: "mine" | "all";
  status?: TaskStatus;
  assigneeId?: string;
}

export type NotContributorError = { type: "not_contributor" };
export type NotFoundError = { type: "not_found" };
export type NotWorkspaceMemberError = { type: "assignee_not_member" };

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

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

function toTask(row: TaskRow, assigneeName: string | null): Task {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    title: row.title,
    description: row.description,
    assigneeId: row.assignee_id,
    assigneeName,
    dueDate: row.due_date,
    status: row.status,
    linkedType: row.linked_type as TaskLinkedType | null,
    linkedId: row.linked_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

async function attachAssigneeNames(rows: TaskRow[]): Promise<Task[]> {
  const assigneeIds = [
    ...new Set(rows.map((r) => r.assignee_id).filter((id): id is string => id !== null)),
  ];
  if (assigneeIds.length === 0) {
    return rows.map((row) => toTask(row, null));
  }
  const supabase = await createClient();
  const { data: profiles, error } = await supabase.rpc("get_co_member_profiles", {
    target_user_ids: assigneeIds,
  });
  if (error) {
    throw new Error(`attachAssigneeNames query failed: ${error.message}`);
  }
  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.name]));
  return rows.map((row) =>
    toTask(row, row.assignee_id ? (nameById.get(row.assignee_id) ?? null) : null),
  );
}

// Backend-Schema.md §5.7: "viewer" is read-only for tasks -- RLS's own
// tasks_insert_contributor/tasks_update_contributor policies already
// enforce this, this pre-check just turns a thrown RLS error into a
// clean typed result (same pattern as lib/services/workspace.ts's
// getMyRole).
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

export async function createTask(
  ctx: RequestContext,
  workspaceId: string,
  input: CreateTaskInput,
): Promise<Result<Task, NotContributorError | NotWorkspaceMemberError>> {
  const contributorCheck = await requireContributor(ctx, workspaceId);
  if (!contributorCheck.ok) return contributorCheck;

  if (input.assigneeId && !(await isWorkspaceMember(workspaceId, input.assigneeId))) {
    return err({ type: "assignee_not_member" });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: workspaceId,
      title: input.title,
      description: input.description ?? null,
      assignee_id: input.assigneeId ?? null,
      due_date: input.dueDate ?? null,
      linked_type: input.linkedType ?? null,
      linked_id: input.linkedId ?? null,
      created_by: ctx.userId,
    })
    .select("*")
    .single();
  if (error) {
    throw new Error(`createTask insert failed: ${error.message}`);
  }

  const [task] = await attachAssigneeNames([data]);
  return ok(task);
}

export async function listTasks(
  ctx: RequestContext,
  workspaceId: string,
  filter: TaskFilter,
): Promise<Task[]> {
  const supabase = await createClient();
  let query = supabase
    .from("tasks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filter.view === "mine") {
    query = query.eq("assignee_id", ctx.userId);
  }
  if (filter.status) {
    query = query.eq("status", filter.status);
  }
  if (filter.assigneeId) {
    query = query.eq("assignee_id", filter.assigneeId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`listTasks query failed: ${error.message}`);
  }
  return attachAssigneeNames(data ?? []);
}

async function getTaskWorkspaceId(taskId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("workspace_id")
    .eq("id", taskId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) {
    throw new Error(`getTaskWorkspaceId query failed: ${error.message}`);
  }
  return data?.workspace_id ?? null;
}

export async function updateTask(
  ctx: RequestContext,
  taskId: string,
  input: UpdateTaskInput,
): Promise<Result<void, NotContributorError | NotFoundError | NotWorkspaceMemberError>> {
  const workspaceId = await getTaskWorkspaceId(taskId);
  if (!workspaceId) return err({ type: "not_found" });

  const contributorCheck = await requireContributor(ctx, workspaceId);
  if (!contributorCheck.ok) return contributorCheck;

  if (input.assigneeId && !(await isWorkspaceMember(workspaceId, input.assigneeId))) {
    return err({ type: "assignee_not_member" });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.assigneeId !== undefined && { assignee_id: input.assigneeId }),
      ...(input.dueDate !== undefined && { due_date: input.dueDate }),
      ...(input.status !== undefined && { status: input.status }),
    })
    .eq("id", taskId);
  if (error) {
    throw new Error(`updateTask update failed: ${error.message}`);
  }
  return ok(undefined);
}

export async function assignTask(
  ctx: RequestContext,
  taskId: string,
  assigneeId: string | null,
): Promise<Result<void, NotContributorError | NotFoundError | NotWorkspaceMemberError>> {
  return updateTask(ctx, taskId, { assigneeId });
}

// Backend-Schema.md §1.3 soft-delete: sets deleted_at via the same
// tasks_update_contributor policy, no DELETE policy exists.
export async function deleteTask(
  ctx: RequestContext,
  taskId: string,
): Promise<Result<void, NotContributorError | NotFoundError>> {
  const workspaceId = await getTaskWorkspaceId(taskId);
  if (!workspaceId) return err({ type: "not_found" });

  const contributorCheck = await requireContributor(ctx, workspaceId);
  if (!contributorCheck.ok) return contributorCheck;

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", taskId);
  if (error) {
    throw new Error(`deleteTask update failed: ${error.message}`);
  }
  return ok(undefined);
}
