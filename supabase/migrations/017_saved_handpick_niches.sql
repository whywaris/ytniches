-- ==========================================
-- SAVED HANDPICK NICHES TABLE
-- ==========================================
create table public.saved_handpick_niches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  handpick_id uuid references public.handpick_niches(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, handpick_id)
);

-- Indexes
create index idx_saved_handpick_user_id
  on public.saved_handpick_niches(user_id);
create index idx_saved_handpick_niche_id
  on public.saved_handpick_niches(handpick_id);

-- RLS
alter table public.saved_handpick_niches enable row level security;

create policy "users_read_own_saved_handpick"
  on public.saved_handpick_niches
  for select using (auth.uid() = user_id);

create policy "users_insert_own_saved_handpick"
  on public.saved_handpick_niches
  for insert with check (auth.uid() = user_id);

create policy "users_delete_own_saved_handpick"
  on public.saved_handpick_niches
  for delete using (auth.uid() = user_id);
