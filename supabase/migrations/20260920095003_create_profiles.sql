-- Down:
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user();
-- drop table if exists public.profiles;

-- Backend-Schema.md §2.2. One-to-one with auth.users (managed by Supabase
-- Auth, never modified directly).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  avatar_url text,
  time_zone text not null default 'UTC',
  onboarding_step int not null default 0,
  primary_goal text,
  youtube_channel_id text,
  role text not null default 'user',
  theme_preference text not null default 'system',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check
    check (role in ('user', 'staff', 'super_admin')),
  constraint profiles_primary_goal_check
    check (primary_goal is null or primary_goal in ('explorer', 'stuck', 'grower', 'operator')),
  constraint profiles_theme_preference_check
    check (theme_preference in ('system', 'dark', 'light'))
);

create index profiles_role_idx on public.profiles (role);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "users_read_own_profile" on public.profiles
  for select
  using (auth.uid() = id);

create policy "users_update_own_profile" on public.profiles
  for update
  using (auth.uid() = id);

-- Column-level grants: authenticated users may update their own editable
-- fields only. `role` is deliberately excluded from this grant, along with
-- `id`/`created_at`/`updated_at`/`deleted_at` — role changes are a
-- service-role-only, admin-controlled operation (Security.md §3.3) and
-- account deletion goes through the service-layer /api/user/account flow
-- (Security.md §3.6), not a direct client UPDATE. This is NOT an omission:
-- do not add `role` or `deleted_at` to this grant to "fix" a perceived gap.
-- Without this, the RLS policy above (`auth.uid() = id`) alone would let a
-- user set their own role to 'super_admin' via a direct PostgREST call.
revoke update on public.profiles from authenticated;
grant update (
  name, avatar_url, time_zone, onboarding_step,
  primary_goal, youtube_channel_id, theme_preference
) on public.profiles to authenticated;

-- Auto-creates the profile row on signup (OAuth or email/password alike).
-- security definer + fixed search_path: runs as the function owner
-- (bypasses RLS by Postgres superuser/owner semantics on this project),
-- so no client-facing INSERT policy is needed on profiles.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
