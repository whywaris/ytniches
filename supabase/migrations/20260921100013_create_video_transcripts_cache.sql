-- Down:
-- drop table if exists public.video_transcripts_cache;

-- Backend-Schema.md §3.3. Separate from `videos` because transcripts are
-- large and only fetched on demand (AI Prompts generation, Phase 1 Task 3).
-- Shared/cache data like channels/videos, but goes further: no
-- `authenticated` grant at all, not even read. No UI ever shows raw
-- transcript text directly (the generated prompt output does, derived) --
-- only lib/services/prompts.ts, via the service role, ever touches this
-- table.
create table public.video_transcripts_cache (
  id uuid primary key default gen_random_uuid(),
  video_id uuid not null unique references public.videos (id) on delete cascade,
  transcript_text text not null,
  language text not null,
  source text not null,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_video_transcripts_cache_updated_at
  before update on public.video_transcripts_cache
  for each row execute function public.set_updated_at();

alter table public.video_transcripts_cache enable row level security;

-- No policies for authenticated/anon -- RLS enabled with zero grants means
-- everyone except the service role (which bypasses RLS entirely) is denied
-- by default. Deliberate: nothing in the UI reads this table directly.
