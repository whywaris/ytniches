-- ==========================================
-- PROMPT FIELDS TABLE
-- ==========================================
create table public.prompt_fields (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  placeholder text default '',
  show_to_users boolean not null default true,
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- NICHE PROMPTS TABLE (simplified)
-- ==========================================
create table if not exists public.niche_prompts (
  id uuid default gen_random_uuid() primary key,
  channel_name text not null,
  channel_url text not null default '',
  published boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- PROMPT FIELD VALUES TABLE
-- ==========================================
create table public.prompt_field_values (
  id uuid default gen_random_uuid() primary key,
  niche_prompt_id uuid references public.niche_prompts(id) on delete cascade not null,
  field_id uuid references public.prompt_fields(id) on delete cascade not null,
  value text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(niche_prompt_id, field_id)
);

-- Indexes
create index idx_prompt_fields_position on public.prompt_fields(position);
create index idx_prompt_fields_active on public.prompt_fields(is_active);
create index idx_prompt_field_values_niche on public.prompt_field_values(niche_prompt_id);
create index idx_prompt_field_values_field on public.prompt_field_values(field_id);

-- Triggers
create trigger handle_prompt_fields_updated_at
  before update on public.prompt_fields
  for each row execute function public.handle_updated_at();

create trigger handle_prompt_field_values_updated_at
  before update on public.prompt_field_values
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.prompt_fields enable row level security;
alter table public.prompt_field_values enable row level security;
alter table public.niche_prompts enable row level security;

create policy "admin_all_prompt_fields" on public.prompt_fields
  for all using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "users_read_active_fields" on public.prompt_fields
  for select using (
    is_active = true and show_to_users = true and
    exists (select 1 from public.users where id = auth.uid() and plan in ('pro', 'lifetime'))
  );

create policy "admin_all_niche_prompts" on public.niche_prompts
  for all using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "pro_read_niche_prompts" on public.niche_prompts
  for select using (
    published = true and
    exists (select 1 from public.users where id = auth.uid() and plan in ('pro', 'lifetime'))
  );

create policy "admin_all_field_values" on public.prompt_field_values
  for all using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "pro_read_field_values" on public.prompt_field_values
  for select using (
    exists (select 1 from public.users where id = auth.uid() and plan in ('pro', 'lifetime'))
  );

-- ==========================================
-- SEED DEFAULT FIELDS
-- ==========================================
insert into public.prompt_fields (name, slug, placeholder, show_to_users, position, is_active) values
  ('About This Niche',        'about_this_niche',         'Describe what this niche is about...',          true, 0, true),
  ('Title Generation Prompt', 'title_generation_prompt',  'Prompt for generating video titles...',         true, 1, true),
  ('Chapters Generation',     'chapters_generation',      'Prompt for generating video chapters...',       true, 2, true),
  ('Script Generation',       'script_generation',        'Prompt for generating video scripts...',        true, 3, true),
  ('Images Generation',       'images_generation',        'Prompt for generating images...',               true, 4, true),
  ('Thumbnail Generation',    'thumbnail_generation',     'Prompt for generating thumbnails...',           true, 5, true),
  ('Tags',                    'tags',                     'Tags or tag generation prompt...',              true, 6, true),
  ('Voice Over Tool',         'voice_over_tool',          'Recommended voiceover tool or prompt...',       true, 7, true),
  ('Editing Tips',            'editing_tips',             'Editing tips and recommendations...',           true, 8, true);
