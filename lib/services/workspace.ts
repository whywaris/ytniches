import { randomBytes } from "node:crypto";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendWorkspaceInviteEmail } from "@/lib/email/invitations";
import { err, ok, type Result } from "@/lib/result";
import type { RequestContext } from "@/lib/context";
import type { Database } from "@/lib/supabase/database.types";

export type WorkspaceRole = Database["public"]["Enums"]["workspace_role"];

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface WorkspaceWithMembers extends Workspace {
  members: WorkspaceMember[];
}

export interface MyWorkspaceMembership {
  workspaceId: string;
  role: WorkspaceRole;
}

export interface InvitationPreview {
  workspaceName: string;
  role: WorkspaceRole;
}

export type NotTeamTierError = { type: "not_team_tier" };
export type NotFoundError = { type: "not_found" };
export type NotAdminError = { type: "not_admin" };
export type InvalidInvitationError = { type: "invalid_invitation" };
export type MustTransferOrDeleteError = { type: "must_transfer_or_delete" };
export type CannotRemoveOwnerError = { type: "cannot_remove_owner" };

// Monetization.md §2.4/§2.5: workspace features are Team-tier only.
// Server-side gate, same as isEmailEligibleTier for email notifications --
// never trust a client-only check for a paid-tier feature.
function requireTeamTier(ctx: RequestContext): Result<true, NotTeamTierError> {
  return ctx.tier === "team" ? ok(true) : err({ type: "not_team_tier" });
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 60);
  return base || "workspace";
}

// Not exposed via RLS to non-admins (workspace_invitations has no
// non-admin SELECT policy — Backend-Schema.md §5.7), so admin-gated
// actions on this table check role directly rather than relying on a
// thrown RLS error to distinguish "not admin" from a real failure.
async function getMyRole(ctx: RequestContext, workspaceId: string): Promise<WorkspaceRole | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", ctx.userId)
    .maybeSingle();
  if (error) {
    throw new Error(`getMyRole query failed: ${error.message}`);
  }
  return data?.role ?? null;
}

async function attachMemberProfiles(
  memberRows: { id: string; user_id: string; role: WorkspaceRole; joined_at: string }[],
): Promise<WorkspaceMember[]> {
  if (memberRows.length === 0) return [];
  const supabase = await createClient();
  const { data: profiles, error } = await supabase.rpc("get_co_member_profiles", {
    target_user_ids: memberRows.map((m) => m.user_id),
  });
  if (error) {
    throw new Error(`attachMemberProfiles query failed: ${error.message}`);
  }
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  return memberRows.map((m) => ({
    id: m.id,
    userId: m.user_id,
    name: profileById.get(m.user_id)?.name ?? null,
    avatarUrl: profileById.get(m.user_id)?.avatar_url ?? null,
    role: m.role,
    joinedAt: m.joined_at,
  }));
}

// PRD.md §8.1. A user belongs to at most one workspace in this build --
// nothing in the spec (D-044) calls for multi-workspace switching UI, so
// the page just needs "does this user have a workspace, and which one" to
// decide between the create form and the overview.
export async function listMyWorkspaceMemberships(
  ctx: RequestContext,
): Promise<MyWorkspaceMembership[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", ctx.userId);
  if (error) {
    throw new Error(`listMyWorkspaceMemberships query failed: ${error.message}`);
  }
  return (data ?? []).map((row) => ({ workspaceId: row.workspace_id, role: row.role }));
}

// Two inserts (workspace, then the owner's own admin membership row) --
// not a single RPC/transaction, because Supabase's JS client has no
// multi-statement transaction primitive. Not idempotent if the second
// insert fails after the first succeeds, but workspace_members_select
// filters an orphaned memberless workspace out of every list this user
// would see, and workspaces_delete_admin requires an admin membership
// that doesn't exist yet either -- it becomes an inert, invisible row,
// not a corrupted-looking one. Acceptable for this build; a cleanup job
// isn't worth adding for a two-line window.
export async function createWorkspace(
  ctx: RequestContext,
  name: string,
): Promise<Result<Workspace, NotTeamTierError>> {
  const tierCheck = requireTeamTier(ctx);
  if (!tierCheck.ok) return tierCheck;

  const supabase = await createClient();
  const baseSlug = slugify(name);
  let slug = baseSlug;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: workspace, error } = await supabase
      .from("workspaces")
      .insert({ name, slug, owner_id: ctx.userId })
      .select("id, name, slug, owner_id")
      .single();

    if (error) {
      if (error.code === "23505") {
        slug = `${baseSlug}-${randomBytes(2).toString("hex")}`;
        continue;
      }
      throw new Error(`createWorkspace insert failed: ${error.message}`);
    }

    const { error: memberError } = await supabase.from("workspace_members").insert({
      workspace_id: workspace.id,
      user_id: ctx.userId,
      role: "admin",
    });
    if (memberError) {
      throw new Error(`createWorkspace member bootstrap failed: ${memberError.message}`);
    }

    return ok({
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      ownerId: workspace.owner_id,
    });
  }

  throw new Error(
    `createWorkspace: could not find a free slug after 5 attempts (base "${baseSlug}")`,
  );
}

// RLS (workspaces_select_member) already scopes visibility to members --
// a non-member and a nonexistent workspace both resolve to zero rows, so
// both map to the same not_found rather than leaking which one it was.
export async function getWorkspace(
  ctx: RequestContext,
  workspaceId: string,
): Promise<Result<WorkspaceWithMembers, NotFoundError>> {
  void ctx;
  const supabase = await createClient();
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("id, name, slug, owner_id")
    .eq("id", workspaceId)
    .maybeSingle();
  if (error) {
    throw new Error(`getWorkspace query failed: ${error.message}`);
  }
  if (!workspace) return err({ type: "not_found" });

  const { data: memberRows, error: membersError } = await supabase
    .from("workspace_members")
    .select("id, user_id, role, joined_at")
    .eq("workspace_id", workspaceId);
  if (membersError) {
    throw new Error(`getWorkspace members query failed: ${membersError.message}`);
  }

  const members = await attachMemberProfiles(memberRows ?? []);
  return ok({
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    ownerId: workspace.owner_id,
    members,
  });
}

// Backend-Schema.md §5.7: workspace_invitations has no non-admin SELECT/
// INSERT policy, so this pre-checks role for a clean typed error rather
// than letting a non-admin's insert fail as a generic RLS violation.
// Doesn't pre-check "already invited" or "already a member" -- not
// DB-enforced either (see that migration's own comment); acceptInvitation
// treats an already-member accept as an idempotent success.
export async function inviteMember(
  ctx: RequestContext,
  workspaceId: string,
  email: string,
  role: WorkspaceRole,
): Promise<Result<void, NotAdminError>> {
  const myRole = await getMyRole(ctx, workspaceId);
  if (myRole !== "admin") return err({ type: "not_admin" });

  const supabase = await createClient();
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .single();
  if (workspaceError) {
    throw new Error(`inviteMember workspace lookup failed: ${workspaceError.message}`);
  }

  const token = randomBytes(32).toString("hex");
  const { error } = await supabase.from("workspace_invitations").insert({
    workspace_id: workspaceId,
    email,
    role,
    token,
    invited_by: ctx.userId,
  });
  if (error) {
    throw new Error(`inviteMember insert failed: ${error.message}`);
  }

  void sendWorkspaceInviteEmail(email, { workspaceName: workspace.name, role, token });
  return ok(undefined);
}

// No RequestContext: this backs the public /invite?token=... preview,
// reachable before the visitor has signed in at all. Service-role client
// is the only way to read workspace_invitations pre-auth — that table has
// no non-admin SELECT policy (Backend-Schema.md §5.7's "the token itself
// is the credential, not the visitor's session"). Deliberately returns
// only workspace name + role, never the invitation id/email/token itself.
export async function getInvitationPreview(
  token: string,
): Promise<Result<InvitationPreview, InvalidInvitationError>> {
  const service = createServiceClient();
  const { data: invitation, error } = await service
    .from("workspace_invitations")
    .select("role, accepted_at, expires_at, workspace_id")
    .eq("token", token)
    .maybeSingle();
  if (error) {
    throw new Error(`getInvitationPreview lookup failed: ${error.message}`);
  }
  if (
    !invitation ||
    invitation.accepted_at !== null ||
    new Date(invitation.expires_at) <= new Date()
  ) {
    return err({ type: "invalid_invitation" });
  }

  const { data: workspace, error: workspaceError } = await service
    .from("workspaces")
    .select("name")
    .eq("id", invitation.workspace_id)
    .single();
  if (workspaceError) {
    throw new Error(`getInvitationPreview workspace lookup failed: ${workspaceError.message}`);
  }

  return ok({ workspaceName: workspace.name, role: invitation.role });
}

// Service-role client, not RLS: validating "does a live invitation for my
// email exist" is a cross-entity check (token -> invitation -> email
// match against the *authenticated* user's own email) that workspace_
// members' bootstrap-only INSERT policy deliberately doesn't attempt --
// see that migration's comment. Still leaves its own audit trail: the
// inserted membership row plus the invitation's own accepted_at.
export async function acceptInvitation(
  ctx: RequestContext,
  token: string,
): Promise<Result<Workspace, InvalidInvitationError>> {
  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user?.email) {
    return err({ type: "invalid_invitation" });
  }

  const service = createServiceClient();
  const { data: invitation, error } = await service
    .from("workspace_invitations")
    .select("id, workspace_id, email, role, accepted_at, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (error) {
    throw new Error(`acceptInvitation lookup failed: ${error.message}`);
  }
  if (
    !invitation ||
    invitation.accepted_at !== null ||
    new Date(invitation.expires_at) <= new Date() ||
    invitation.email !== user.email.toLowerCase()
  ) {
    return err({ type: "invalid_invitation" });
  }

  const { data: workspace, error: workspaceError } = await service
    .from("workspaces")
    .select("id, name, slug, owner_id")
    .eq("id", invitation.workspace_id)
    .single();
  if (workspaceError) {
    throw new Error(`acceptInvitation workspace lookup failed: ${workspaceError.message}`);
  }

  const { data: existingMembership, error: membershipError } = await service
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", invitation.workspace_id)
    .eq("user_id", ctx.userId)
    .maybeSingle();
  if (membershipError) {
    throw new Error(`acceptInvitation membership lookup failed: ${membershipError.message}`);
  }

  if (!existingMembership) {
    const { error: insertError } = await service.from("workspace_members").insert({
      workspace_id: invitation.workspace_id,
      user_id: ctx.userId,
      role: invitation.role,
      invited_by: ctx.userId,
    });
    if (insertError) {
      throw new Error(`acceptInvitation member insert failed: ${insertError.message}`);
    }
  }

  const { error: acceptError } = await service
    .from("workspace_invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);
  if (acceptError) {
    throw new Error(`acceptInvitation update failed: ${acceptError.message}`);
  }

  return ok({
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    ownerId: workspace.owner_id,
  });
}

// PRD.md §8.1's "owner cannot leave without transferring ownership or
// deleting workspace" applies to force-removal too -- an admin removing
// the owner would leave the workspace ownerless the same way self-leave
// would.
export async function removeMember(
  ctx: RequestContext,
  workspaceId: string,
  userId: string,
): Promise<Result<void, NotAdminError | CannotRemoveOwnerError>> {
  const myRole = await getMyRole(ctx, workspaceId);
  if (myRole !== "admin") return err({ type: "not_admin" });

  const supabase = await createClient();
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();
  if (workspaceError) {
    throw new Error(`removeMember workspace lookup failed: ${workspaceError.message}`);
  }
  if (workspace.owner_id === userId) {
    return err({ type: "cannot_remove_owner" });
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(`removeMember delete failed: ${error.message}`);
  }
  return ok(undefined);
}

export async function updateMemberRole(
  ctx: RequestContext,
  workspaceId: string,
  userId: string,
  role: WorkspaceRole,
): Promise<Result<void, NotAdminError>> {
  const myRole = await getMyRole(ctx, workspaceId);
  if (myRole !== "admin") return err({ type: "not_admin" });

  const supabase = await createClient();
  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);
  if (error) {
    throw new Error(`updateMemberRole update failed: ${error.message}`);
  }
  return ok(undefined);
}

export async function leaveWorkspace(
  ctx: RequestContext,
  workspaceId: string,
): Promise<Result<void, MustTransferOrDeleteError>> {
  const supabase = await createClient();
  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();
  if (workspaceError) {
    throw new Error(`leaveWorkspace workspace lookup failed: ${workspaceError.message}`);
  }
  if (workspace.owner_id === ctx.userId) {
    return err({ type: "must_transfer_or_delete" });
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", ctx.userId);
  if (error) {
    throw new Error(`leaveWorkspace delete failed: ${error.message}`);
  }
  return ok(undefined);
}

// Security.md §3.2: any admin can delete, not just the owner (RLS's own
// workspaces_delete_admin policy already enforces this — this call just
// surfaces "you're not an admin" as a typed result instead of a thrown
// RLS error). Cascades to workspace_members/workspace_invitations
// (ON DELETE CASCADE) and nulls tracked_channels.workspace_id /
// prompts.workspace_id (ON DELETE SET NULL) automatically.
export async function deleteWorkspace(
  ctx: RequestContext,
  workspaceId: string,
): Promise<Result<void, NotAdminError>> {
  const myRole = await getMyRole(ctx, workspaceId);
  if (myRole !== "admin") return err({ type: "not_admin" });

  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").delete().eq("id", workspaceId);
  if (error) {
    throw new Error(`deleteWorkspace delete failed: ${error.message}`);
  }
  return ok(undefined);
}
