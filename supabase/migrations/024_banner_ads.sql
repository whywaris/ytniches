-- Drop old ads table if exists
drop table if exists public.ad_slots cascade;

-- Banner Ads table
create table public.banner_ads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  image_url text not null,
  click_url text not null default '',
  alt_text text not null default '',
  placement text not null default 'inline'
    check (placement in ('sidebar', 'inline', 'footer')),
  is_active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_banner_ads_active on public.banner_ads(is_active);
create index idx_banner_ads_placement on public.banner_ads(placement);
create index idx_banner_ads_position on public.banner_ads(position);

-- Trigger
create trigger handle_banner_ads_updated_at
  before update on public.banner_ads
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.banner_ads enable row level security;

-- Anyone can read active ads (needed for public pages)
create policy "public_read_active_ads" on public.banner_ads
  for select using (is_active = true);

-- Admin can do everything
create policy "admin_all_banner_ads" on public.banner_ads
  for all using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );
