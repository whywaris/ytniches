"use server";

import { getRequestContext } from "@/lib/context";
import {
  assignTask,
  createTask,
  deleteTask,
  listTasks,
  updateTask,
  type NotContributorError,
  type NotFoundError,
  type NotWorkspaceMemberError,
  type Task,
  type TaskFilter,
} from "@/lib/services/tasks";
import { CreateTaskInputSchema, UpdateTaskInputSchema } from "@/lib/services/tasks.schema";
import { err, type Result } from "@/lib/result";

export type ValidationError = { type: "validation_error"; fields: Record<string, string> };

function toValidationError(fieldErrors: Record<string, string[] | undefined>): ValidationError {
  const fields: Record<string, string> = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) fields[field] = messages[0];
  }
  return { type: "validation_error", fields };
}

// Thin per CLAUDE.md's Server Action pattern.

export async function listTasksAction(workspaceId: string, filter: TaskFilter): Promise<Task[]> {
  const ctx = await getRequestContext();
  return listTasks(ctx, workspaceId, filter);
}

export async function createTaskAction(
  workspaceId: string,
  input: unknown,
): Promise<Result<Task, NotContributorError | NotWorkspaceMemberError | ValidationError>> {
  const parsed = CreateTaskInputSchema.safeParse(input);
  if (!parsed.success) {
    return err(toValidationError(parsed.error.flatten().fieldErrors));
  }
  const ctx = await getRequestContext();
  return createTask(ctx, workspaceId, parsed.data);
}

export async function updateTaskAction(
  taskId: string,
  input: unknown,
): Promise<
  Result<void, NotContributorError | NotFoundError | NotWorkspaceMemberError | ValidationError>
> {
  const parsed = UpdateTaskInputSchema.safeParse(input);
  if (!parsed.success) {
    return err(toValidationError(parsed.error.flatten().fieldErrors));
  }
  const ctx = await getRequestContext();
  return updateTask(ctx, taskId, parsed.data);
}

export async function assignTaskAction(
  taskId: string,
  assigneeId: string | null,
): Promise<Result<void, NotContributorError | NotFoundError | NotWorkspaceMemberError>> {
  const ctx = await getRequestContext();
  return assignTask(ctx, taskId, assigneeId);
}

export async function deleteTaskAction(
  taskId: string,
): Promise<Result<void, NotContributorError | NotFoundError>> {
  const ctx = await getRequestContext();
  return deleteTask(ctx, taskId);
}
