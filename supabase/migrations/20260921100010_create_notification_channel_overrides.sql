-- Down:
-- drop table if exists public.notification_channel_overrides;

-- Backend-Schema.md §4.4: "Per-channel override table... exists only when
-- user overrides the default for a specific channel." No row = no
-- override = fall back to notification_preferences (or its own true
-- default, if no preference row exists either).
create table public.notification_channel_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel_id uuid not null references public.channels (id) on delete cascade,
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index notification_channel_overrides_user_channel_idx
  on public.notification_channel_overrides (user_id, channel_id);

create trigger set_notification_channel_overrides_updated_at
  before update on public.notification_channel_overrides
  for each row execute function public.set_updated_at();

alter table public.notification_channel_overrides enable row level security;

create policy "users_read_own_channel_overrides" on public.notification_channel_overrides
  for select
  using (auth.uid() = user_id);

create policy "users_insert_own_channel_overrides" on public.notification_channel_overrides
  for insert
  with check (auth.uid() = user_id);

create policy "users_update_own_channel_overrides" on public.notification_channel_overrides
  for update
  using (auth.uid() = user_id);

create policy "users_delete_own_channel_overrides" on public.notification_channel_overrides
  for delete
  using (auth.uid() = user_id);
