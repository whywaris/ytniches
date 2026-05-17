-- ============================================================
-- 001_initial_schema.sql
-- YTNiches — core tables, indexes, triggers, auth hook
-- ============================================================

-- ==========================================
-- USERS TABLE
-- ==========================================
create table public.users (
  id                          uuid references auth.users(id) on delete cascade primary key,
  email                       text not null,
  plan                        text not null default 'free'
                                check (plan in ('free', 'pro', 'lifetime')),
  is_admin                    boolean not null default false,
  saved_niches                text[] default '{}',
  lemonsqueezy_customer_id    text,
  lemonsqueezy_subscription_id text,
  plan_expires_at             timestamptz,
  created_at                  timestamptz default now(),
  updated_at                  timestamptz default now()
);

comment on table public.users is 'App-level user profiles mirroring auth.users.';
comment on column public.users.plan is 'Billing plan: free | pro | lifetime.';
comment on column public.users.saved_niches is 'Array of niche UUIDs the user has bookmarked.';

-- ==========================================
-- NICHES TABLE
-- ==========================================
create table public.niches (
  id                  uuid default gen_random_uuid() primary key,
  name                text not null,
  slug                text not null unique,
  category            text not null,
  cpm_min             numeric(10,2) not null,
  cpm_max             numeric(10,2) not null,
  competition_level   text not null check (competition_level in ('Low', 'Medium', 'High')),
  growth_trend        text default 'stable' check (growth_trend in ('rising', 'stable', 'declining')),
  avg_views           text,
  best_upload_day     text,
  ideal_video_length  text,
  top_audience        text,
  age_group           text,
  audience_size       text,
  video_ideas         text[] default '{}',
  script_hooks        jsonb default '[]',
  title_templates     text[] default '{}',
  thumbnail_prompts   text[] default '{}',
  content_calendar    jsonb default '{}',
  is_premium          boolean not null default true,
  published           boolean not null default false,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

comment on table public.niches is 'YouTube niche research entries.';
comment on column public.niches.script_hooks is 'JSON array of {label, text} hook objects.';
comment on column public.niches.content_calendar is 'JSON {weeks:[{week_number,label,days:[{day,title}]}]}.';

-- ==========================================
-- BLOG POSTS TABLE
-- ==========================================
create table public.blog_posts (
  id           uuid default gen_random_uuid() primary key,
  title        text not null,
  slug         text not null unique,
  content      text not null default '',
  excerpt      text,
  cover_image  text,
  author       text not null default 'YTNiches Team',
  author_id    uuid references public.users(id) on delete set null,
  tags         text[] default '{}',
  published    boolean not null default false,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

comment on table public.blog_posts is 'Blog / editorial content.';

-- ==========================================
-- SAVED NICHES JUNCTION TABLE
-- ==========================================
create table public.saved_niches (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references public.users(id) on delete cascade not null,
  niche_id   uuid references public.niches(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, niche_id)
);

comment on table public.saved_niches is 'Many-to-many: users ↔ niches bookmarks.';

-- ==========================================
-- INDEXES
-- ==========================================
create index idx_niches_slug             on public.niches(slug);
create index idx_niches_category         on public.niches(category);
create index idx_niches_is_premium       on public.niches(is_premium);
create index idx_niches_published        on public.niches(published);
create index idx_niches_competition      on public.niches(competition_level);
create index idx_blog_posts_slug         on public.blog_posts(slug);
create index idx_blog_posts_published    on public.blog_posts(published);
create index idx_saved_niches_user_id    on public.saved_niches(user_id);
create index idx_saved_niches_niche_id   on public.saved_niches(niche_id);
create index idx_users_plan              on public.users(plan);

-- ==========================================
-- UPDATED_AT TRIGGER FUNCTION
-- ==========================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger handle_niches_updated_at
  before update on public.niches
  for each row execute function public.handle_updated_at();

create trigger handle_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.handle_updated_at();

-- ==========================================
-- AUTO-CREATE USER PROFILE ON AUTH SIGNUP
-- ==========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data->>'email', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================
-- HELPER: is_admin check (avoids recursive RLS)
-- ==========================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.users where id = auth.uid()),
    false
  );
$$;

-- ==========================================
-- HELPER: get_user_plan (used in RLS)
-- ==========================================
create or replace function public.get_user_plan()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select plan from public.users where id = auth.uid()),
    'free'
  );
$$;
