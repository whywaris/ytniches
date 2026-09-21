-- Down:
-- drop table if exists public.videos;

-- Backend-Schema.md §3.2. Cached YouTube video data, shared across users —
-- everyone-read, service-role-only-write per §6.1.
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id text not null,
  channel_id uuid not null references public.channels (id) on delete cascade,
  title text not null,
  description text,
  thumbnail_url text not null,
  duration_seconds int not null,
  view_count bigint not null default 0,
  like_count int,
  comment_count int,
  published_at timestamptz not null,
  tags text[] not null default '{}',
  language text,
  has_transcript boolean not null default false,
  last_synced_at timestamptz not null default now(),
  unavailable_since timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index videos_youtube_video_id_idx on public.videos (youtube_video_id);
create index videos_channel_published_idx on public.videos (channel_id, published_at desc);
create index videos_view_count_idx on public.videos (view_count desc);

create trigger set_videos_updated_at
  before update on public.videos
  for each row execute function public.set_updated_at();

alter table public.videos enable row level security;

-- Public YouTube data, no user scoping needed on read (Backend-Schema.md
-- §6.1). No INSERT/UPDATE/DELETE policy for `authenticated` — writes are
-- service-layer only (lib/youtube/), same pattern as credit_events.
create policy "anyone_read_videos" on public.videos
  for select
  using (true);
