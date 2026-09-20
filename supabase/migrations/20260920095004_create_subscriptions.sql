-- Down:
-- drop table if exists public.subscriptions;

-- Backend-Schema.md §2.3. One-to-one active per user; historical rows kept
-- for audit. All writes are service-role only (billing webhooks) — see RLS
-- below, which grants SELECT only.
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  tier subscription_tier not null,
  status subscription_status not null,
  provider text not null,
  provider_subscription_id text,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  trial_ends_at timestamptz,
  cancelled_at timestamptz,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_provider_check
    check (provider in ('stripe', 'paddle', 'manual'))
);

create index subscriptions_user_current_idx on public.subscriptions (user_id, is_current);

-- Enforces the documented invariant "only one row per user has true".
create unique index subscriptions_one_current_per_user
  on public.subscriptions (user_id)
  where is_current;

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

-- Read-only for the owner. No INSERT/UPDATE/DELETE policy for `authenticated`
-- is intentional: Postgres RLS default-denies any operation without a
-- matching policy. All writes come from billing webhooks / service-layer
-- code using the service role (TRD.md §3.1, §6.3). Do not add write
-- policies here to "fix" a perceived gap.
create policy "users_read_own_subscriptions" on public.subscriptions
  for select
  using (auth.uid() = user_id);
