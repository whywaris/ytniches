-- Create new global CTA table
create table public.global_cta (
  id uuid default gen_random_uuid() primary key,
  is_active boolean not null default true,
  heading text not null default '',
  subheading text not null default '',
  primary_button_text text not null default '',
  primary_button_url text not null default '',
  secondary_button_text text not null default '',
  secondary_button_url text not null default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Updated at trigger
create trigger handle_global_cta_updated_at
  before update on public.global_cta
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.global_cta enable row level security;

create policy "public_read_global_cta" on public.global_cta
  for select using (true);

create policy "admin_all_global_cta" on public.global_cta
  for all using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

-- Seed a default CTA record
insert into public.global_cta (
  is_active, heading, subheading,
  primary_button_text, primary_button_url,
  secondary_button_text, secondary_button_url
) values (
  true,
  'Find Your Perfect YouTube Niche',
  'Join thousands of creators using YTNiches to grow their channels.',
  'Start free today', '/auth/signup',
  'See pricing', '/pricing'
);

-- Drop old table
drop table if exists public.cta_settings cascade;
