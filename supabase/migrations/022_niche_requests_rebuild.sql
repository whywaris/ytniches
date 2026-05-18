-- Drop old requests tables
drop table if exists public.niche_request_votes cascade;
drop table if exists public.niche_requests cascade;

-- New simple requests table
create table public.niche_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  request_type text not null check (request_type in ('niche', 'prompts')),
  niche_name text not null,
  description text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'under_review', 'completed', 'rejected')),
  admin_note text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_niche_requests_user on public.niche_requests(user_id);
create index idx_niche_requests_status on public.niche_requests(status);
create index idx_niche_requests_created on public.niche_requests(created_at desc);

-- Trigger
create trigger handle_niche_requests_updated_at
  before update on public.niche_requests
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.niche_requests enable row level security;

create policy "users_read_own_requests" on public.niche_requests
  for select using (auth.uid() = user_id);

create policy "users_insert_own_requests" on public.niche_requests
  for insert with check (auth.uid() = user_id);

create policy "admin_all_requests" on public.niche_requests
  for all using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );
