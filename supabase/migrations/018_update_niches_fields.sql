-- Add missing fields to niches table if not exist
alter table public.niches
  add column if not exists channel_name text,
  add column if not exists channel_url text,
  add column if not exists estimated_earning text,
  add column if not exists channel_age text,
  add column if not exists subscribers text,
  add column if not exists views_day text,
  add column if not exists total_videos text,
  add column if not exists total_views text,
  add column if not exists thumbnail_url_1 text,
  add column if not exists thumbnail_url_2 text,
  add column if not exists thumbnail_url_3 text,
  add column if not exists is_hot boolean default false,
  add column if not exists slug text;

-- Generate slugs for existing niches that dont have one
update public.niches
set slug = lower(
  regexp_replace(
    regexp_replace(name, '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  )
)
where slug is null;

-- Make slug unique
create unique index if not exists idx_niches_slug_unique
  on public.niches(slug)
  where slug is not null;

-- Index for hot niches
create index if not exists idx_niches_is_hot
  on public.niches(is_hot);
