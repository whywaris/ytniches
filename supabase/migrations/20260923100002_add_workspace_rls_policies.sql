-- Down:
-- drop policy if exists "workspace_invitations_delete_admin" on public.workspace_invitations;
-- drop policy if exists "workspace_invitations_insert_admin" on public.workspace_invitations;
-- drop policy if exists "workspace_invitations_select_admin" on public.workspace_invitations;
-- drop policy if exists "workspace_members_delete_self_or_admin" on public.workspace_members;
-- drop policy if exists "workspace_members_update_admin" on public.workspace_members;
-- drop policy if exists "workspace_members_insert_bootstrap" on public.workspace_members;
-- drop policy if exists "workspace_members_select" on public.workspace_members;
-- drop policy if exists "workspaces_delete_admin" on public.workspaces;
-- drop policy if exists "workspaces_update_admin" on public.workspaces;
-- drop policy if exists "workspaces_select_member" on public.workspaces;
-- drop policy if exists "workspaces_insert_as_owner" on public.workspaces;
-- drop function if exists public.workspace_has_no_members(uuid);
-- drop function if exists public.is_workspace_owner(uuid);
-- drop function if exists public.is_workspace_admin(uuid);
-- drop function if exists public.is_workspace_member(uuid);

-- Security.md §3.2's workspace RLS model (admin: read+write all, invite/
-- remove members, delete workspace; editor/viewer: narrower — enforced at
-- the service layer for now, nothing in Phase 3 Task 1 needs an editor/
-- viewer-specific RLS carve-out yet).
--
-- Every non-trivial policy here goes through a SECURITY DEFINER helper
-- instead of a raw `workspace_id in (select ... from workspace_members
-- where user_id = auth.uid())` subquery, for two reasons found while
-- verifying this migration (not just written defensively):
--
-- 1. workspace_members' own SELECT/INSERT/UPDATE/DELETE policies subquery
--    workspace_members itself (the standard multi-tenant membership
--    idiom), and workspaces/workspace_invitations' admin policies
--    subquery workspace_members from another table's policy. Both trip
--    Postgres's RLS recursion guard (42P17: "infinite recursion detected
--    in policy") the moment the querying role isn't bypass-RLS, because
--    evaluating the inner subquery re-applies workspace_members's own
--    policy, which subqueries itself again. A SECURITY DEFINER function
--    runs as its owner, bypassing RLS for just that internal lookup, so
--    the check no longer re-invokes the policy it's called from — same
--    fixed-search-path pattern as handle_new_user() (Phase 0's hardening
--    migration).
-- 2. The bootstrap INSERT policy (a brand-new workspace's owner inserting
--    themselves as its first admin member) can't check ownership via a
--    raw `select id from workspaces where owner_id = auth.uid()` subquery
--    either: that SELECT is itself gated by workspaces_select_member,
--    which requires an existing membership row — which doesn't exist yet
--    at this exact moment (that's the row being inserted). Chicken-and-egg,
--    caught by actually running the insert as a real user during
--    verification, not by inspection. is_workspace_owner() bypasses that
--    for the same RLS-recursion reason as above.
--
-- Each function is scoped to `authenticated` only (revoked from
-- public/anon) — required so the RLS engine can still evaluate them for
-- real signed-in users, but not reachable by anonymous PostgREST RPC
-- callers. `authenticated` can still invoke them directly as RPC (Postgres
-- doesn't offer a way to grant "only from within a policy"), but each one
-- only reveals a boolean about the CALLING user's own membership/admin/
-- owner status or a workspace's own emptiness — never another user's data
-- or an arbitrary count — so that residual exposure isn't a real leak.
create function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid()
  );
$$;
revoke execute on function public.is_workspace_member(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid) to authenticated;

create function public.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid() and role = 'admin'
  );
$$;
revoke execute on function public.is_workspace_admin(uuid) from public, anon;
grant execute on function public.is_workspace_admin(uuid) to authenticated;

create function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.workspaces where id = target_workspace_id and owner_id = auth.uid()
  );
$$;
revoke execute on function public.is_workspace_owner(uuid) from public, anon;
grant execute on function public.is_workspace_owner(uuid) to authenticated;

create function public.workspace_has_no_members(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.workspace_members where workspace_id = target_workspace_id
  );
$$;
revoke execute on function public.workspace_has_no_members(uuid) from public, anon;
grant execute on function public.workspace_has_no_members(uuid) to authenticated;

-- workspaces --------------------------------------------------------------

-- Any authenticated user may create a workspace naming themselves owner;
-- createWorkspace's service function then inserts the matching admin
-- workspace_members row in the same call (bootstrap policy below).
create policy "workspaces_insert_as_owner" on public.workspaces
  for insert
  with check (owner_id = auth.uid());

create policy "workspaces_select_member" on public.workspaces
  for select
  using (public.is_workspace_member(id));

create policy "workspaces_update_admin" on public.workspaces
  for update
  using (public.is_workspace_admin(id));

-- deleteWorkspace's "owner must transfer ownership or delete" business
-- rule (PRD.md §8.1) is enforced in lib/services/workspace.ts, not here —
-- every workspace's owner is always also its first admin member (see the
-- bootstrap insert policy below), so narrowing this to owner-only at the
-- RLS layer would just be a redundant, less-flexible restatement of the
-- same admin check.
create policy "workspaces_delete_admin" on public.workspaces
  for delete
  using (public.is_workspace_admin(id));

-- workspace_members -----------------------------------------------------

create policy "workspace_members_select" on public.workspace_members
  for select
  using (public.is_workspace_member(workspace_id));

-- Bootstrap case only: the workspace owner inserting themselves as the
-- first (admin) member right after creating the workspace. Every other way
-- a membership row comes into existence — acceptInvitation — goes through
-- lib/services/workspace.ts's service-role client instead of this policy,
-- because validating "does a live invitation for my email exist" needs a
-- join across workspace_invitations keyed on auth.jwt() email that isn't
-- worth expressing in SQL for a single call site (see lib/credits/
-- index.ts's refund() for the same "cross-entity check → service role,
-- not RLS" precedent). Accepting still leaves its own audit trail: the
-- inserted workspace_members row plus the invitation's own accepted_at.
create policy "workspace_members_insert_bootstrap" on public.workspace_members
  for insert
  with check (
    user_id = auth.uid()
    and role = 'admin'
    and public.is_workspace_owner(workspace_id)
    and public.workspace_has_no_members(workspace_id)
  );

create policy "workspace_members_update_admin" on public.workspace_members
  for update
  using (public.is_workspace_admin(workspace_id));

-- leaveWorkspace (self) or removeMember (an admin acting on someone else).
-- The "owner can't leave without transferring or deleting" rule is a
-- business check in lib/services/workspace.ts, same reasoning as the
-- workspaces delete policy above.
create policy "workspace_members_delete_self_or_admin" on public.workspace_members
  for delete
  using (user_id = auth.uid() or public.is_workspace_admin(workspace_id));

-- workspace_invitations ---------------------------------------------------

-- Admin-only for every authenticated-role policy on this table. The
-- token-authenticated preview an unauthenticated (or wrong-account)
-- visitor needs on /invite?token=... deliberately has no policy here at
-- all — that lookup goes through a server-only action using the
-- service-role client (same reasoning as password-reset/email-verify
-- tokens: the token itself is the credential, not the visitor's session),
-- never a direct PostgREST call gated by RLS. Accepting (setting
-- accepted_at) is also service-role, from acceptInvitation — see the
-- workspace_members bootstrap comment above.
create policy "workspace_invitations_select_admin" on public.workspace_invitations
  for select
  using (public.is_workspace_admin(workspace_id));

create policy "workspace_invitations_insert_admin" on public.workspace_invitations
  for insert
  with check (public.is_workspace_admin(workspace_id));

create policy "workspace_invitations_delete_admin" on public.workspace_invitations
  for delete
  using (public.is_workspace_admin(workspace_id));
