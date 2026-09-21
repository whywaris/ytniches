-- Down:
-- drop table if exists public.tracked_channels;

-- Backend-Schema.md §4.1. Pulled forward from Competitor Tracking (Phase 1
-- Task 2) because Niche Finder's "Save channel" action (PRD.md §6.1) routes
-- here — see Implementation-Plan.md §3.1 gap discussion. Only the table +
-- the save action ship now; activity feed, polling, and the tracking
-- dashboard remain Task 2 scope.
--
-- `workspace_id` has no FK yet — the `workspaces` table doesn't exist until
-- Phase 3 (Backend-Schema.md §5). Column is added now, nullable, always
-- null in Phase 1, so Phase 3 doesn't need a migration to add it later
-- (same pattern Backend-Schema.md §5 describes for every user-scoped table).
create table public.tracked_channels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  workspace_id uuid,
  channel_id uuid not null references public.channels (id) on delete cascade,
  tracked_since timestamptz not null default now(),
  custom_label text,
  refresh_cadence_hours int not null default 24,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index tracked_channels_user_channel_idx on public.tracked_channels (user_id, channel_id);
create index tracked_channels_channel_id_idx on public.tracked_channels (channel_id);

create trigger set_tracked_channels_updated_at
  before update on public.tracked_channels
  for each row execute function public.set_updated_at();

alter table public.tracked_channels enable row level security;

-- Standard user-scoped policy pattern (Backend-Schema.md §6.1), same shape
-- as the profiles/credit_events policies from Phase 0.
create policy "users_read_own_tracked_channels" on public.tracked_channels
  for select
  using (auth.uid() = user_id);

create policy "users_insert_own_tracked_channels" on public.tracked_channels
  for insert
  with check (auth.uid() = user_id);

create policy "users_update_own_tracked_channels" on public.tracked_channels
  for update
  using (auth.uid() = user_id);

create policy "users_delete_own_tracked_channels" on public.tracked_channels
  for delete
  using (auth.uid() = user_id);
