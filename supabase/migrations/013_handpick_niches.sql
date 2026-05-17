-- ==========================================
-- HANDPICK NICHES TABLE
-- ==========================================
create table public.handpick_niches (
  id uuid default gen_random_uuid() primary key,
  channel_name text not null,
  image_url text not null,
  channel_url text not null,
  category text not null,
  monthly_earning_range text not null,
  niche_tags text[] default '{}',
  subscribers text not null default '0',
  channel_age text not null default '',
  is_hot boolean not null default false,
  is_pro_only boolean not null default false,
  published boolean not null default false,
  position integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_handpick_niches_category on public.handpick_niches(category);
create index idx_handpick_niches_published on public.handpick_niches(published);
create index idx_handpick_niches_position on public.handpick_niches(position);
create index idx_handpick_niches_is_hot on public.handpick_niches(is_hot);

-- Updated at trigger
create trigger handle_handpick_niches_updated_at
  before update on public.handpick_niches
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.handpick_niches enable row level security;

-- Public can read non-pro published niches
create policy "public_read_published_handpick" on public.handpick_niches
  for select using (published = true and is_pro_only = false);

-- Pro users can read pro-only published niches
create policy "pro_read_pro_handpick" on public.handpick_niches
  for select using (
    published = true and
    is_pro_only = true and
    exists (
      select 1 from public.users
      where id = auth.uid()
      and plan in ('pro', 'lifetime')
    )
  );

-- Admins can do everything
create policy "admin_all_handpick" on public.handpick_niches
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- ==========================================
-- SEED DATA
-- ==========================================
insert into public.handpick_niches (
  channel_name, image_url, channel_url, category,
  monthly_earning_range, niche_tags, subscribers,
  channel_age, is_hot, is_pro_only, published, position
) values
(
  'Finance Facts Daily',
  'https://yt3.googleusercontent.com/placeholder1',
  'https://youtube.com/@financefactsdaily',
  'Finance & Business',
  '$5,000 – $15,000/mo',
  ARRAY['High CPM', 'Faceless', 'Low Competition', 'Trending 2025'],
  '7.2K',
  '4 months',
  true, false, true, 0
),
(
  'AI Tools Weekly',
  'https://yt3.googleusercontent.com/placeholder2',
  'https://youtube.com/@aitoolsweekly',
  'Science & Technology',
  '$3,000 – $8,000/mo',
  ARRAY['AI Niche', 'Growing Fast', 'No Face Needed'],
  '12.4K',
  '6 months',
  true, false, true, 1
),
(
  'Budget Travel Hub',
  'https://yt3.googleusercontent.com/placeholder3',
  'https://youtube.com/@budgettravelhub',
  'Travel & Events',
  '$2,000 – $6,000/mo',
  ARRAY['Travel', 'Medium CPM', 'Passion Niche'],
  '3.8K',
  '2 months',
  false, true, true, 2
);
