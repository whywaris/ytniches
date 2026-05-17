-- ─── Title Formats ────────────────────────────────────────────────────────────
create table if not exists public.title_formats (
  id              uuid default gen_random_uuid() primary key,
  name            text not null,
  slug            text not null unique,
  description     text not null,
  hook_type       text not null default '',
  how_to_use      text[] default '{}',
  categories      text[] default '{}',
  examples        jsonb not null default '[]',
  favorites_count integer not null default 0,
  published       boolean not null default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_title_formats_published on public.title_formats(published);
alter table public.title_formats enable row level security;

create policy "pro_select_title_formats" on public.title_formats
  for select using (
    published = true
    and exists (
      select 1 from public.users
      where id = auth.uid() and plan in ('pro', 'lifetime')
    )
  );

create policy "admin_all_title_formats" on public.title_formats
  for all using (public.is_admin());

-- ─── Thumbnail Formats ────────────────────────────────────────────────────────
create table if not exists public.thumbnail_formats (
  id              uuid default gen_random_uuid() primary key,
  name            text not null,
  slug            text not null unique,
  description     text not null,
  design_elements text[] default '{}',
  color_scheme    text not null default '',
  how_to_use      text[] default '{}',
  categories      text[] default '{}',
  examples        jsonb not null default '[]',
  favorites_count integer not null default 0,
  published       boolean not null default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_thumbnail_formats_published on public.thumbnail_formats(published);
alter table public.thumbnail_formats enable row level security;

create policy "pro_select_thumbnail_formats" on public.thumbnail_formats
  for select using (
    published = true
    and exists (
      select 1 from public.users
      where id = auth.uid() and plan in ('pro', 'lifetime')
    )
  );

create policy "admin_all_thumbnail_formats" on public.thumbnail_formats
  for all using (public.is_admin());

-- ─── Seed: Title Formats ──────────────────────────────────────────────────────
insert into public.title_formats (name, slug, description, hook_type, how_to_use, categories, examples, published)
values
(
  'WTF Is Happening To...',
  'wtf-is-happening-to',
  'Capitalizes on confusion and concern about something changing or declining. Creates urgency and emotional investment.',
  'Curiosity + Concern',
  array[
    'Replace "X" with a brand, platform, person, or trend',
    'Works best when something is visibly changing or struggling',
    'Pair with a thumbnail showing contrast or decline'
  ],
  array['Business, Finance & Money', 'Technology', 'Entertainment & Comedy'],
  '[
    {
      "title": "WTF Is Happening To YouTube?",
      "channel": "Wendover Productions",
      "subscribers": "4.2M",
      "views": "3.1M",
      "multiplier": "0.74x",
      "vpd": 8500,
      "thumbnail_url": "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
      "youtube_video_id": "jNQXAC9IVRw"
    },
    {
      "title": "WTF Is Happening To Spotify?",
      "channel": "Andrei Jikh",
      "subscribers": "1.9M",
      "views": "2.8M",
      "multiplier": "1.47x",
      "vpd": 7700,
      "thumbnail_url": "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
      "youtube_video_id": "9bZkp7q19f0"
    },
    {
      "title": "WTF Is Happening To The Economy?",
      "channel": "Graham Stephan",
      "subscribers": "4.6M",
      "views": "5.2M",
      "multiplier": "1.13x",
      "vpd": 14300,
      "thumbnail_url": "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
      "youtube_video_id": "kJQP7kiw5Fk"
    }
  ]'::jsonb,
  true
),
(
  'The Untold Story Of...',
  'the-untold-story-of',
  'Implies hidden information mainstream sources ignored. Positions the creator as an insider with exclusive knowledge.',
  'Exclusivity + Curiosity',
  array[
    'Use for historical figures, companies, or events',
    'Works best with topics the audience thinks they know',
    'Emphasize the "secret" angle in your thumbnail'
  ],
  array['Documentary', 'Business, Finance & Money', 'Education & How-To'],
  '[
    {
      "title": "The Untold Story Of McDonald''s",
      "channel": "Company Man",
      "subscribers": "3.1M",
      "views": "4.7M",
      "multiplier": "1.52x",
      "vpd": 12900,
      "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      "youtube_video_id": "dQw4w9WgXcQ"
    },
    {
      "title": "The Untold Story Of Nike",
      "channel": "How Money Works",
      "subscribers": "2.4M",
      "views": "3.3M",
      "multiplier": "1.38x",
      "vpd": 9100,
      "thumbnail_url": "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
      "youtube_video_id": "jNQXAC9IVRw"
    }
  ]'::jsonb,
  true
);

-- ─── Seed: Thumbnail Formats ──────────────────────────────────────────────────
insert into public.thumbnail_formats (name, slug, description, design_elements, color_scheme, how_to_use, categories, examples, published)
values
(
  'Shocked Face + Bold Text',
  'shocked-face-bold-text',
  'Person with exaggerated surprised expression paired with large bold text. Creates emotional connection and curiosity.',
  array['Expressive face', 'Bold contrasting text', 'Simple background', 'Color pop'],
  'High contrast — bright background with dark text, or vice versa',
  array[
    'Use a genuine surprised expression, not overly fake',
    'Keep text to 3–5 words maximum',
    'Face should take up at least 40% of the thumbnail'
  ],
  array['Entertainment & Comedy', 'Business, Finance & Money', 'Education & How-To'],
  '[
    {
      "title": "I Lost Everything",
      "channel": "MrBeast",
      "subscribers": "200M",
      "views": "45M",
      "thumbnail_url": "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
      "design_notes": "Red background, extreme zoom on face, white bold text",
      "youtube_video_id": "dQw4w9WgXcQ"
    },
    {
      "title": "They Banned Me",
      "channel": "PewDiePie",
      "subscribers": "111M",
      "views": "22M",
      "thumbnail_url": "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
      "design_notes": "Dark background, shocked open mouth, yellow text with stroke",
      "youtube_video_id": "jNQXAC9IVRw"
    }
  ]'::jsonb,
  true
);
