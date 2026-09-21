-- Down:
-- drop table if exists public.notification_preferences;

-- Backend-Schema.md §4.4. Per-user, per-notification-type toggles. The
-- settings UI to edit these is Phase 2 (per this task's scope), but the
-- table + full RLS ship now: channel-sync's fan-out already needs to read
-- in_app_enabled (defaulting true, since no row exists until a user
-- explicitly changes a preference), and there's no reason to gate the API
-- surface more tightly than the data model requires just because no UI
-- calls it yet.
create table public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  notification_type text not null,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default false,
  slack_enabled boolean not null default false,
  digest_cadence text not null default 'off',
  quiet_hours_start time,
  quiet_hours_end time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_preferences_digest_cadence_check
    check (digest_cadence in ('off', 'daily', 'weekly'))
);

create unique index notification_preferences_user_type_idx
  on public.notification_preferences (user_id, notification_type);

create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

alter table public.notification_preferences enable row level security;

-- Standard per-user CRUD (Backend-Schema.md §6.1's prompts pattern) — a
-- user fully owns their own preference rows.
create policy "users_read_own_notification_preferences" on public.notification_preferences
  for select
  using (auth.uid() = user_id);

create policy "users_insert_own_notification_preferences" on public.notification_preferences
  for insert
  with check (auth.uid() = user_id);

create policy "users_update_own_notification_preferences" on public.notification_preferences
  for update
  using (auth.uid() = user_id);

create policy "users_delete_own_notification_preferences" on public.notification_preferences
  for delete
  using (auth.uid() = user_id);
