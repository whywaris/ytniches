-- ==========================================
-- EMAIL PREFERENCES TABLE
-- ==========================================
create table public.email_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade unique not null,
  weekly_digest boolean default true,
  niche_alerts boolean default true,
  request_updates boolean default true,
  product_updates boolean default true,
  unsubscribed_all boolean default false,
  unsubscribe_token text unique default gen_random_uuid()::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================================
-- EMAIL LOGS TABLE
-- ==========================================
create table public.email_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete set null,
  email_type text not null,
  subject text not null,
  status text default 'sent' check (status in ('sent', 'failed', 'bounced')),
  resend_id text,
  sent_at timestamptz default now()
);

-- ==========================================
-- WEEKLY DIGEST LOG
-- ==========================================
create table public.digest_logs (
  id uuid default gen_random_uuid() primary key,
  week_start date not null,
  week_end date not null,
  users_sent integer default 0,
  niches_featured integer default 0,
  sent_at timestamptz default now(),
  unique(week_start)
);

-- Indexes
create index idx_email_preferences_user on public.email_preferences(user_id);
create index idx_email_preferences_weekly on public.email_preferences(weekly_digest);
create index idx_email_logs_user on public.email_logs(user_id);
create index idx_email_logs_type on public.email_logs(email_type);
create index idx_digest_logs_week on public.digest_logs(week_start);

-- Auto create email preferences when user signs up
create or replace function handle_new_user_email_prefs()
returns trigger as $$
begin
  insert into public.email_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_user_created_email_prefs
  after insert on public.users
  for each row execute function handle_new_user_email_prefs();

-- Updated at trigger
create trigger handle_email_preferences_updated_at
  before update on public.email_preferences
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.email_preferences enable row level security;
alter table public.email_logs enable row level security;
alter table public.digest_logs enable row level security;

-- Users can read and update their own email preferences
create policy "users_manage_own_email_prefs" on public.email_preferences
  for all using (auth.uid() = user_id);

-- Users can read their own email logs
create policy "users_read_own_email_logs" on public.email_logs
  for select using (auth.uid() = user_id);

-- Admins can read all
create policy "admin_read_all_email_logs" on public.email_logs
  for select using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "admin_manage_digest_logs" on public.digest_logs
  for all using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

-- Backfill email preferences for all existing users
insert into public.email_preferences (user_id)
select id from public.users
on conflict (user_id) do nothing;
