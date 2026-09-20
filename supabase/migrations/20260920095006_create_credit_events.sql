-- Down:
-- drop table if exists public.credit_events;

-- Backend-Schema.md §2.5. Append-only ledger of every credit movement;
-- balance is derived (SUM(amount) WHERE user_id = ? AND created_at >=
-- cycle_start), never stored. Read-only for authenticated users — all
-- writes are service-layer credit-consumption code using the service role.
create table public.credit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_type credit_event_type not null,
  amount int not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  related_resource text,
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index credit_events_user_created_idx on public.credit_events (user_id, created_at);

-- Enforces the column's documented purpose: "prevents double-charging on
-- retries" (Backend-Schema.md §2.5), per the idempotency pattern in
-- TRD.md §3.4.
create unique index credit_events_idempotency_key_idx
  on public.credit_events (idempotency_key)
  where idempotency_key is not null;

create trigger set_credit_events_updated_at
  before update on public.credit_events
  for each row execute function public.set_updated_at();

alter table public.credit_events enable row level security;

-- Read-only: no INSERT/UPDATE/DELETE policy for `authenticated`. The ledger
-- is append-only and written exclusively by service-role code.
create policy "users_read_own_credit_events" on public.credit_events
  for select
  using (auth.uid() = user_id);
