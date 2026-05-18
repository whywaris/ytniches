-- ==========================================
-- DROP OLD TABLES (clean slate)
-- ==========================================
drop table if exists public.prompt_field_values cascade;
drop table if exists public.prompt_fields cascade;
drop table if exists public.niche_prompts cascade;

-- ==========================================
-- PROMPT TEMPLATES TABLE
-- Global field definitions (Title Generation, Hook, etc.)
-- Admin manages these — apply to ALL niches
-- ==========================================
create table public.prompt_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  placeholder text default '',
  access text not null default 'free' check (access in ('free', 'pro')),
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- NICHE CHANNELS TABLE
-- Each channel (Dan Martell, Kee, etc.)
-- ==========================================
create table public.niche_channels (
  id uuid default gen_random_uuid() primary key,
  channel_name text not null,
  channel_url text not null default '',
  category text default '',
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- NICHE PROMPT VALUES TABLE
-- Actual prompt content per channel per field
-- ==========================================
create table public.niche_prompt_values (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references public.niche_channels(id) on delete cascade not null,
  template_id uuid references public.prompt_templates(id) on delete cascade not null,
  content text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(channel_id, template_id)
);

-- ==========================================
-- INDEXES
-- ==========================================
create index idx_prompt_templates_position
  on public.prompt_templates(position);
create index idx_prompt_templates_active
  on public.prompt_templates(is_active);
create index idx_niche_channels_position
  on public.niche_channels(position);
create index idx_niche_prompt_values_channel
  on public.niche_prompt_values(channel_id);
create index idx_niche_prompt_values_template
  on public.niche_prompt_values(template_id);

-- ==========================================
-- UPDATED AT TRIGGERS
-- ==========================================
create trigger handle_prompt_templates_updated_at
  before update on public.prompt_templates
  for each row execute function public.handle_updated_at();

create trigger handle_niche_channels_updated_at
  before update on public.niche_channels
  for each row execute function public.handle_updated_at();

create trigger handle_niche_prompt_values_updated_at
  before update on public.niche_prompt_values
  for each row execute function public.handle_updated_at();

-- ==========================================
-- RLS
-- ==========================================
alter table public.prompt_templates enable row level security;
alter table public.niche_channels enable row level security;
alter table public.niche_prompt_values enable row level security;

-- Prompt templates: anyone can read active ones
create policy "public_read_prompt_templates" on public.prompt_templates
  for select using (is_active = true);

create policy "admin_all_prompt_templates" on public.prompt_templates
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- Niche channels: logged in users can read
create policy "auth_read_niche_channels" on public.niche_channels
  for select using (
    auth.uid() is not null and is_active = true
  );

create policy "admin_all_niche_channels" on public.niche_channels
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- Prompt values: 
-- Free fields = all logged in users
-- Pro fields = only pro/lifetime users
create policy "users_read_free_prompt_values" on public.niche_prompt_values
  for select using (
    auth.uid() is not null and
    exists (
      select 1 from public.prompt_templates
      where id = template_id
      and access = 'free'
      and is_active = true
    )
  );

create policy "pro_read_pro_prompt_values" on public.niche_prompt_values
  for select using (
    exists (
      select 1 from public.prompt_templates
      where id = template_id
      and access = 'pro'
      and is_active = true
    ) and
    exists (
      select 1 from public.users
      where id = auth.uid()
      and plan in ('pro', 'lifetime')
    )
  );

create policy "admin_all_prompt_values" on public.niche_prompt_values
  for all using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- ==========================================
-- SEED DEFAULT TEMPLATES
-- ==========================================
insert into public.prompt_templates
  (name, slug, placeholder, access, position, is_active)
values
  ('About This Niche', 'about_this_niche',
   'Describe what this niche is about...', 'free', 0, true),

  ('Title Generation', 'title_generation',
   'Prompt for generating video titles...', 'free', 1, true),

  ('Hook Writing', 'hook_writing',
   'Prompt for writing scroll-stopping hooks...', 'pro', 2, true),

  ('Full Script', 'full_script',
   'Prompt for generating complete video scripts...', 'pro', 3, true),

  ('Thumbnail Ideas', 'thumbnail_ideas',
   'Prompt for generating thumbnail concepts...', 'pro', 4, true),

  ('SEO & Tags', 'seo_tags',
   'Prompt for generating tags and SEO optimization...', 'pro', 5, true);
