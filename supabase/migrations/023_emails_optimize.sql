-- Email logs table
create table if not exists public.email_logs (
  id uuid default gen_random_uuid() primary key,
  email_type text not null,
  recipient_email text not null,
  recipient_user_id uuid references public.users(id) on delete set null,
  subject text not null default '',
  status text not null default 'sent'
    check (status in ('sent', 'failed', 'bounced')),
  resend_id text default '',
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Broadcast emails table
create table if not exists public.broadcast_emails (
  id uuid default gen_random_uuid() primary key,
  subject text not null,
  body text not null,
  segment text not null default 'all'
    check (segment in ('all', 'pro', 'free')),
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipients_count integer default 0,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index idx_email_logs_type on public.email_logs(email_type);
create index idx_email_logs_status on public.email_logs(status);
create index idx_email_logs_created on public.email_logs(created_at desc);
create index idx_email_logs_user on public.email_logs(recipient_user_id);
create index idx_broadcast_emails_status on public.broadcast_emails(status);
create index idx_broadcast_emails_scheduled on public.broadcast_emails(scheduled_at);

-- Triggers
create trigger handle_broadcast_emails_updated_at
  before update on public.broadcast_emails
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.email_logs enable row level security;
alter table public.broadcast_emails enable row level security;

create policy "admin_all_email_logs" on public.email_logs
  for all using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

create policy "admin_all_broadcast_emails" on public.broadcast_emails
  for all using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );
