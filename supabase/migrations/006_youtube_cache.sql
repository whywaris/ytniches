create table public.youtube_cache (
  video_id  text primary key,
  data      jsonb not null,
  cached_at timestamptz default now()
);

create index idx_youtube_cache_cached_at on public.youtube_cache(cached_at);

alter table public.youtube_cache enable row level security;
-- Only service role (admin client) can read/write this table
