-- Down:
-- drop policy if exists "workspace_members_read_profiles" on public.profiles;
-- drop function if exists public.shares_workspace_with(uuid);

-- Backend-Schema.md §2.2's profiles RLS (`auth.uid() = id`, self-only) was
-- correct before Phase 3 -- nothing needed to see another user's name.
-- Phase 3 Tasks 1-3 all do (workspace member list, task assignees,
-- calendar assignees), all through
-- lib/services/{workspace,tasks,calendar}.ts's own attachMemberProfiles/
-- attachAssigneeNames helpers, which query `profiles` with the session
-- client (RLS-enforced, correctly -- these are read paths reachable by
-- any signed-in workspace member, not an admin-only operation, so no
-- service-role bypass here). Caught live: with a single-member test
-- workspace this never surfaced (every lookup was auth.uid() looking up
-- their own row); adding a second real member exposed it immediately --
-- their name silently resolved to null ("Unnamed") everywhere, never an
-- error, because the profiles query itself succeeded, just filtered by
-- RLS to a row that doesn't exist from the caller's perspective.
create function public.shares_workspace_with(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members mine
    join public.workspace_members theirs on theirs.workspace_id = mine.workspace_id
    where mine.user_id = auth.uid() and theirs.user_id = target_user_id
  );
$$;
revoke execute on function public.shares_workspace_with(uuid) from public, anon;
grant execute on function public.shares_workspace_with(uuid) to authenticated;

create policy "workspace_members_read_profiles" on public.profiles
  for select
  using (public.shares_workspace_with(id));
