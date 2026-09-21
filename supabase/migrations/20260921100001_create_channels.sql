-- Down:
-- drop table if exists public.channels;

-- Backend-Schema.md §3.1. Cached YouTube channel data, shared across users
-- (not user-scoped) — everyone-read, service-role-only-write per §6.1.
create table public.channels (
  id uuid primary key default gen_random_uuid(),
  youtube_channel_id text not null,
  handle text,
  name text not null,
  description text,
  avatar_url text,
  banner_url text,
  subscriber_count bigint not null default 0,
  video_count int not null default 0,
  total_view_count bigint not null default 0,
  country text,
  language text,
  is_monetized boolean,
  youtube_created_at timestamptz not null,
  last_synced_at timestamptz not null default now(),
  unavailable_since timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index channels_youtube_channel_id_idx on public.channels (youtube_channel_id);
create index channels_subscriber_count_idx on public.channels (subscriber_count);
create index channels_country_language_idx on public.channels (country, language);

create trigger set_channels_updated_at
  before update on public.channels
  for each row execute function public.set_updated_at();

alter table public.channels enable row level security;

-- Public YouTube data, no user scoping needed on read (Backend-Schema.md
-- §6.1). No INSERT/UPDATE/DELETE policy for `authenticated` — writes are
-- service-layer only (lib/youtube/), same pattern as credit_events.
create policy "anyone_read_channels" on public.channels
  for select
  using (true);
