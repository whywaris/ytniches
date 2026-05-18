-- Drop old tables
drop table if exists public.niche_prompt_values cascade;
drop table if exists public.prompt_templates cascade;
drop table if exists public.niche_channels cascade;

-- Niche Channels
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

-- Prompt Values (per channel, fully independent)
create table public.niche_prompt_values (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references public.niche_channels(id) on delete cascade not null,
  field_name text not null,
  access text not null default 'free' check (access in ('free', 'pro')),
  content text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_niche_channels_position on public.niche_channels(position);
create index idx_niche_prompt_values_channel on public.niche_prompt_values(channel_id);
create index idx_niche_prompt_values_created on public.niche_prompt_values(created_at);

-- Updated at triggers
create trigger handle_niche_channels_updated_at
  before update on public.niche_channels
  for each row execute function public.handle_updated_at();

create trigger handle_niche_prompt_values_updated_at
  before update on public.niche_prompt_values
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.niche_channels enable row level security;
alter table public.niche_prompt_values enable row level security;

create policy "auth_read_niche_channels" on public.niche_channels
  for select using (auth.uid() is not null and is_active = true);

create policy "admin_all_niche_channels" on public.niche_channels
  for all using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "users_read_free_prompt_values" on public.niche_prompt_values
  for select using (auth.uid() is not null and access = 'free');

create policy "pro_read_pro_prompt_values" on public.niche_prompt_values
  for select using (
    access = 'pro' and
    exists (select 1 from public.users where id = auth.uid() and plan in ('pro', 'lifetime'))
  );

create policy "admin_all_prompt_values" on public.niche_prompt_values
  for all using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );
