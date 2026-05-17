-- ==========================================
-- CTA SETTINGS TABLE
-- Admin controls CTA shown on niche pages
-- ==========================================
create table public.cta_settings (
  id uuid default gen_random_uuid() primary key,
  page text not null unique,
  is_active boolean not null default true,
  heading text not null default 'Ready to start your YouTube channel?',
  subheading text not null default 'Get the complete kit for this niche and 1,200+ others.',
  button_text text not null default 'Start free — no credit card',
  button_url text not null default '/signup',
  button_secondary_text text not null default 'See Pro features',
  button_secondary_url text not null default '/pricing',
  background_color text not null default '#1A1612',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Updated at trigger
create trigger handle_cta_settings_updated_at
  before update on public.cta_settings
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.cta_settings enable row level security;

-- Anyone can read CTAs
create policy "public_read_cta_settings" on public.cta_settings
  for select using (true);

-- Only admins can modify
create policy "admin_all_cta_settings" on public.cta_settings
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- Seed default CTAs
insert into public.cta_settings (page, is_active, heading, subheading, button_text, button_url, button_secondary_text, button_secondary_url)
values
(
  'niche_detail',
  true,
  'Unlock the Complete Niche Kit',
  'Get 30 video ideas, title templates, thumbnail prompts, script hooks, and a 30-day content calendar.',
  'Start free — no credit card',
  '/signup',
  'Go Pro — $9/month',
  '/pricing'
),
(
  'niche_library',
  true,
  'Find Your Perfect YouTube Niche',
  'Browse 1,200+ curated niches with CPM data, video ideas, and complete content kits.',
  'Start free today',
  '/signup',
  'See pricing',
  '/pricing'
);
