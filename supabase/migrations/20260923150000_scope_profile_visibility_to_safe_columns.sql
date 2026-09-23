-- Down:
-- drop function if exists public.get_co_member_profiles(uuid[]);
-- create policy "workspace_members_read_profiles" on public.profiles
--   for select using (public.shares_workspace_with(id));

-- 20260923120001's workspace_members_read_profiles policy correctly scoped
-- *rows* to co-members (verified), but RLS is row-level only -- it exposed
-- every column (role, onboarding_step, primary_goal, onboarding_skipped_at,
-- youtube_channel_id) to any co-member, not just the name/avatar the UI
-- needs. Replace the row policy with a narrow SECURITY DEFINER function
-- that projects only safe columns; self-access still goes through
-- users_read_own_profile.
drop policy "workspace_members_read_profiles" on public.profiles;

create function public.get_co_member_profiles(target_user_ids uuid[])
returns table (id uuid, name text, avatar_url text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.name, p.avatar_url
  from public.profiles p
  where p.id = any(target_user_ids)
    and public.shares_workspace_with(p.id);
$$;
revoke execute on function public.get_co_member_profiles(uuid[]) from public, anon;
grant execute on function public.get_co_member_profiles(uuid[]) to authenticated;
