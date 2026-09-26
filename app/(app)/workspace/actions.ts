"use server";

import { cookies } from "next/headers";

import { getRequestContext } from "@/lib/context";
import {
  acceptInvitation,
  createWorkspace,
  deleteWorkspace,
  inviteMember,
  leaveWorkspace,
  listMyWorkspaceMemberships,
  removeMember,
  updateMemberRole,
  type CannotRemoveOwnerError,
  type InvalidInvitationError,
  type MustTransferOrDeleteError,
  type MyWorkspaceMembership,
  type NotAdminError,
  type NotTeamTierError,
  type WorkspaceFullError,
  type Workspace,
} from "@/lib/services/workspace";
import {
  CreateWorkspaceInputSchema,
  InviteMemberInputSchema,
  UpdateMemberRoleInputSchema,
} from "@/lib/services/workspace.schema";
import { err, type Result } from "@/lib/result";

export type ValidationError = { type: "validation_error"; fields: Record<string, string> };

function toValidationError(fieldErrors: Record<string, string[] | undefined>): ValidationError {
  const fields: Record<string, string> = {};
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) fields[field] = messages[0];
  }
  return { type: "validation_error", fields };
}

// Thin per CLAUDE.md's Server Action pattern: validate input, get the
// caller's context, delegate to the service, return its Result untouched.

export async function listMyWorkspaceMembershipsAction(): Promise<MyWorkspaceMembership[]> {
  const ctx = await getRequestContext();
  return listMyWorkspaceMemberships(ctx);
}

// The client sets the workspace-id cookie right after a create/accept
// succeeds — lib/context.ts reads it back on every subsequent request
// without a DB lookup (Phase 3 kickoff's explicit constraint).
export async function setActiveWorkspaceCookieAction(workspaceId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("workspace-id", workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function createWorkspaceAction(
  input: unknown,
): Promise<Result<Workspace, NotTeamTierError | ValidationError>> {
  const parsed = CreateWorkspaceInputSchema.safeParse(input);
  if (!parsed.success) {
    return err(toValidationError(parsed.error.flatten().fieldErrors));
  }
  const ctx = await getRequestContext();
  return createWorkspace(ctx, parsed.data.name);
}

export async function inviteMemberAction(
  workspaceId: string,
  input: unknown,
): Promise<Result<void, NotAdminError | WorkspaceFullError | ValidationError>> {
  const parsed = InviteMemberInputSchema.safeParse(input);
  if (!parsed.success) {
    return err(toValidationError(parsed.error.flatten().fieldErrors));
  }
  const ctx = await getRequestContext();
  return inviteMember(ctx, workspaceId, parsed.data.email, parsed.data.role);
}

export async function acceptInvitationAction(
  token: string,
): Promise<Result<Workspace, InvalidInvitationError | WorkspaceFullError>> {
  const ctx = await getRequestContext();
  return acceptInvitation(ctx, token);
}

export async function removeMemberAction(
  workspaceId: string,
  userId: string,
): Promise<Result<void, NotAdminError | CannotRemoveOwnerError>> {
  const ctx = await getRequestContext();
  return removeMember(ctx, workspaceId, userId);
}

export async function updateMemberRoleAction(
  workspaceId: string,
  userId: string,
  input: unknown,
): Promise<Result<void, NotAdminError | WorkspaceFullError | ValidationError>> {
  const parsed = UpdateMemberRoleInputSchema.safeParse(input);
  if (!parsed.success) {
    return err(toValidationError(parsed.error.flatten().fieldErrors));
  }
  const ctx = await getRequestContext();
  return updateMemberRole(ctx, workspaceId, userId, parsed.data.role);
}

export async function leaveWorkspaceAction(
  workspaceId: string,
): Promise<Result<void, MustTransferOrDeleteError>> {
  const ctx = await getRequestContext();
  return leaveWorkspace(ctx, workspaceId);
}

export async function deleteWorkspaceAction(
  workspaceId: string,
): Promise<Result<void, NotAdminError>> {
  const ctx = await getRequestContext();
  return deleteWorkspace(ctx, workspaceId);
}
