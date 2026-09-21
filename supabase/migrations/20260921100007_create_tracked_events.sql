-- Down:
-- drop table if exists public.tracked_events;

-- Backend-Schema.md §4.2. Append-only log of events detected on tracked
-- channels, powering the activity feed's underlying data. NOT per-user —
-- events are per-channel and visible to every user tracking that channel
-- (Backend-Schema.md's own note). RLS filters at read time via a join
-- through tracked_channels, rather than a flat user_id column.
create table public.tracked_events (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid not null references public.channels (id) on delete cascade,
  event_type tracked_event_type not null,
  payload jsonb not null default '{}'::jsonb,
  detected_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tracked_events_channel_detected_idx
  on public.tracked_events (channel_id, detected_at desc);

create trigger set_tracked_events_updated_at
  before update on public.tracked_events
  for each row execute function public.set_updated_at();

alter table public.tracked_events enable row level security;

-- A user can read an event only for a channel they actually track — not a
-- flat "everyone reads everything" policy like channels/videos, since
-- tracked_events reveal *tracking relationships*, not just public YouTube
-- data. No INSERT/UPDATE/DELETE policy for `authenticated`: only the
-- channel-sync background job (service role) writes these.
create policy "users_read_tracked_events_for_their_channels" on public.tracked_events
  for select
  using (
    exists (
      select 1 from public.tracked_channels
      where tracked_channels.channel_id = tracked_events.channel_id
        and tracked_channels.user_id = auth.uid()
    )
  );
