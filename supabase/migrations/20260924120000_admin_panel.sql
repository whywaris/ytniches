-- Down:
-- alter role authenticator reset pgrst.db_pre_request; notify pgrst, 'reload config';
-- drop function if exists public.check_request();
-- drop function if exists public.admin_revoke_sessions(uuid);
-- drop function if exists public.admin_list_users(text, text, text, timestamptz, timestamptz, int, int);
-- drop function if exists public.touch_last_active();
-- alter table public.subscriptions drop column if exists amount_cents, drop column if exists billing_interval;
-- alter table public.profiles drop column if exists suspended_at, drop column if exists suspended_reason, drop column if exists last_active_at;
-- drop table if exists public.admin_actions;

-- Backend-Schema.md §6.3. RLS on with NO policies: only the service role
-- (lib/services/admin.ts) can read or write it. idempotency_key is the
-- double-submit guard for money-moving actions (refunds): the unique
-- constraint makes "insert the key" the atomic lock taken before Creem is
-- ever called.
create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id),
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  idempotency_key text unique,
  created_at timestamptz not null default now()
);
create index admin_actions_target_idx on public.admin_actions (target_type, target_id, created_at desc);
alter table public.admin_actions enable row level security;
revoke all on public.admin_actions from anon, authenticated;

-- Suspension + activity. Deliberately not added to authenticated's
-- column-level UPDATE grant on profiles: users can read these on their own
-- row but never write them.
alter table public.profiles
  add column suspended_at timestamptz,
  add column suspended_reason text,
  add column last_active_at timestamptz;

-- Real price, stored from Creem's own product data by the webhook -- MRR is
-- computed from these, never inferred.
alter table public.subscriptions
  add column amount_cents integer check (amount_cents >= 0),
  add column billing_interval text check (billing_interval in ('month', 'year'));

-- Backfill from the payloads Creem already sent us (product.price /
-- product.recurring_interval on the stored subscription.paid events).
update public.subscriptions s
set amount_cents = (w.raw_payload -> 'object' -> 'product' ->> 'price')::integer,
    billing_interval = w.raw_payload -> 'object' -> 'product' ->> 'recurring_interval'
from public.webhook_events w
where w.event_type = 'subscription.paid'
  and w.raw_payload -> 'object' ->> 'id' = s.provider_subscription_id
  and w.raw_payload -> 'object' -> 'product' ->> 'recurring_interval' in ('month', 'year');

-- Called by middleware at most once per UTC day per user (it compares the
-- date first). SECURITY DEFINER because last_active_at isn't user-writable.
create function public.touch_last_active()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles
  set last_active_at = now()
  where id = auth.uid()
    and (last_active_at is null or last_active_at < date_trunc('day', now()));
$$;
revoke execute on function public.touch_last_active() from public, anon;
grant execute on function public.touch_last_active() to authenticated;

-- Admin users list: email lives in auth.users, unreachable through the Data
-- API. Service role only.
create function public.admin_list_users(
  p_search text,
  p_tier text,
  p_status text,
  p_from timestamptz,
  p_to timestamptz,
  p_limit int,
  p_offset int
)
returns table (
  id uuid,
  email text,
  name text,
  role text,
  created_at timestamptz,
  last_active_at timestamptz,
  suspended_at timestamptz,
  tier text,
  subscription_status text,
  total_count bigint
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select p.id, u.email::text, p.name, p.role, p.created_at, p.last_active_at, p.suspended_at,
         s.tier::text, s.status::text, count(*) over () as total_count
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.subscriptions s on s.user_id = p.id and s.is_current
  where p.deleted_at is null
    and (p_search is null or u.email ilike '%' || p_search || '%' or p.name ilike '%' || p_search || '%')
    and (p_tier is null or s.tier::text = p_tier)
    and (p_status is null
         or (p_status = 'suspended' and p.suspended_at is not null)
         or (p_status = 'active' and p.suspended_at is null))
    and (p_from is null or p.created_at >= p_from)
    and (p_to is null or p.created_at < p_to)
  order by p.created_at desc
  limit p_limit offset p_offset;
$$;
revoke execute on function public.admin_list_users(text, text, text, timestamptz, timestamptz, int, int) from public, anon, authenticated;
grant execute on function public.admin_list_users(text, text, text, timestamptz, timestamptz, int, int) to service_role;

-- Suspend = immediate: deleting the sessions (refresh tokens cascade)
-- makes getUser() fail on the very next app request. Service role only.
create function public.admin_revoke_sessions(target_user_id uuid)
returns void
language sql
security definer
set search_path = public, auth
as $$
  delete from auth.sessions where user_id = target_user_id;
$$;
revoke execute on function public.admin_revoke_sessions(uuid) from public, anon, authenticated;
grant execute on function public.admin_revoke_sessions(uuid) to service_role;

-- Suspend also has to stop direct Data API calls made with a still-unexpired
-- access token (the JWT stays cryptographically valid until it expires).
-- PostgREST runs this before every request; a suspended caller gets 403.
-- Service-role requests have no auth.uid() and pass straight through.
create function public.check_request()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and exists (select 1 from public.profiles where id = auth.uid() and suspended_at is not null) then
    raise sqlstate 'PGRST' using
      message = json_build_object('code', 'account_suspended', 'message', 'Account suspended')::text,
      detail = json_build_object('status', 403)::text;
  end if;
end;
$$;
revoke execute on function public.check_request() from public;
grant execute on function public.check_request() to anon, authenticated, service_role;

alter role authenticator set pgrst.db_pre_request = 'public.check_request';
notify pgrst, 'reload config';
