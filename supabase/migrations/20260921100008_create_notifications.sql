-- Down:
-- drop table if exists public.notifications;

-- Backend-Schema.md §4.3. User-scoped notifications derived from
-- tracked_events (channel-sync's fan-out step) — this is what the
-- Competitor Tracking activity feed actually reads (not tracked_events
-- directly), since dismiss/read state is inherently per-user and
-- tracked_events has no such column (it's channel-global).
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text,
  related_resource text,
  read_at timestamptz,
  dismissed_at timestamptz,
  delivered_channels text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index notifications_user_read_created_idx
  on public.notifications (user_id, read_at, created_at desc);

create trigger set_notifications_updated_at
  before update on public.notifications
  for each row execute function public.set_updated_at();

alter table public.notifications enable row level security;

create policy "users_read_own_notifications" on public.notifications
  for select
  using (auth.uid() = user_id);

-- No INSERT policy: notifications are only ever created by the
-- channel-sync fan-out (service role), never by the user directly.
--
-- Column-level UPDATE grant: a user may mark their own notifications
-- read/dismissed, nothing else (title/body/related_resource are
-- system-written and not user-editable). Same pattern as profiles'
-- column-grant (Phase 0) — without this, RLS alone would let a user
-- rewrite their own notification content via a direct PostgREST call.
revoke update on public.notifications from authenticated;
grant update (read_at, dismissed_at) on public.notifications to authenticated;

create policy "users_update_own_notifications" on public.notifications
  for update
  using (auth.uid() = user_id);
