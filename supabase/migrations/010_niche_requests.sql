-- ==========================================
-- NICHE REQUESTS TABLE
-- ==========================================
create table public.niche_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete set null,
  title text not null,
  description text,
  category text not null,
  reason text,
  status text not null default 'pending'
    check (status in ('pending', 'under_review', 'approved', 'completed', 'rejected')),
  votes_count integer not null default 1,
  admin_note text,
  linked_niche_id uuid references public.niches(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- NICHE REQUEST VOTES TABLE
-- ==========================================
create table public.niche_request_votes (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.niche_requests(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(request_id, user_id)
);

-- ==========================================
-- INDEXES
-- ==========================================
create index idx_niche_requests_status on public.niche_requests(status);
create index idx_niche_requests_votes on public.niche_requests(votes_count desc);
create index idx_niche_requests_user on public.niche_requests(user_id);
create index idx_niche_request_votes_request on public.niche_request_votes(request_id);
create index idx_niche_request_votes_user on public.niche_request_votes(user_id);

-- ==========================================
-- UPDATED_AT TRIGGER
-- ==========================================
create trigger handle_niche_requests_updated_at
  before update on public.niche_requests
  for each row execute function public.handle_updated_at();

-- ==========================================
-- AUTO UPDATE VOTES COUNT TRIGGER
-- ==========================================
create or replace function update_request_votes_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update public.niche_requests
    set votes_count = votes_count + 1
    where id = NEW.request_id;
  elsif TG_OP = 'DELETE' then
    update public.niche_requests
    set votes_count = votes_count - 1
    where id = OLD.request_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger on_vote_change
  after insert or delete on public.niche_request_votes
  for each row execute function update_request_votes_count();

-- ==========================================
-- RLS POLICIES
-- ==========================================
alter table public.niche_requests enable row level security;
alter table public.niche_request_votes enable row level security;

-- Anyone logged in can read all requests
create policy "auth_read_niche_requests" on public.niche_requests
  for select using (auth.uid() is not null);

-- Logged in users can create requests
create policy "auth_create_niche_requests" on public.niche_requests
  for insert with check (
    auth.uid() is not null and
    auth.uid() = user_id
  );

-- Users can only update their own pending requests
create policy "users_update_own_requests" on public.niche_requests
  for update using (
    auth.uid() = user_id and status = 'pending'
  );

-- Admins can update all requests
create policy "admin_update_all_requests" on public.niche_requests
  for update using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- Admins can delete requests
create policy "admin_delete_requests" on public.niche_requests
  for delete using (
    exists (
      select 1 from public.users
      where id = auth.uid() and is_admin = true
    )
  );

-- Users can read their own votes
create policy "users_read_own_votes" on public.niche_request_votes
  for select using (auth.uid() = user_id);

-- Users can vote (insert)
create policy "users_insert_vote" on public.niche_request_votes
  for insert with check (
    auth.uid() is not null and
    auth.uid() = user_id
  );

-- Users can remove their own vote
create policy "users_delete_own_vote" on public.niche_request_votes
  for delete using (auth.uid() = user_id);

-- ==========================================
-- REQUEST LIMIT FUNCTION
-- ==========================================
create or replace function check_request_limit()
returns trigger as $$
declare
  request_count integer;
begin
  select count(*) into request_count
  from public.niche_requests
  where user_id = NEW.user_id
    and created_at > now() - interval '30 days';

  if request_count >= 3 then
    raise exception 'Request limit reached. You can submit up to 3 niche requests per month.';
  end if;

  return NEW;
end;
$$ language plpgsql;

create trigger enforce_request_limit
  before insert on public.niche_requests
  for each row execute function check_request_limit();
