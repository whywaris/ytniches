-- Down:
-- drop table if exists public.credit_allocations;

-- Backend-Schema.md §2.4. user_id null = default allocation for the tier;
-- set = per-user override (bonus, comp). Read-only for authenticated users;
-- writes are admin/service-role only.
create table public.credit_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  tier subscription_tier not null,
  credits_per_cycle int not null,
  rollover_max int not null default 0,
  effective_from timestamptz not null default now(),
  effective_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_credit_allocations_updated_at
  before update on public.credit_allocations
  for each row execute function public.set_updated_at();

alter table public.credit_allocations enable row level security;

-- Read-only: a user sees their own override rows plus the tier-default rows
-- (user_id is null). No write policy for `authenticated` — allocations are
-- seeded/managed by admins and service-role code only.
create policy "users_read_own_and_default_allocations" on public.credit_allocations
  for select
  using (auth.uid() = user_id or user_id is null);
