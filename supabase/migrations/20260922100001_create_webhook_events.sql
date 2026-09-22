-- Down:
-- drop table if exists public.webhook_events;

-- Security.md §4.8 / TRD.md §6.3 (Task 5). Raw payload audit trail for
-- every billing-provider webhook, and the idempotency anchor:
-- provider_event_id is unique, so a duplicate delivery hits that
-- constraint before any business logic runs. The row is inserted as a
-- dedup marker BEFORE processing starts (processed_at null), then updated
-- once processing finishes (processed_at set, error set only on failure) --
-- a retry of the same event during a crash mid-processing still collides
-- on provider_event_id instead of double-processing.
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text not null,
  provider_event_id text not null,
  raw_payload jsonb not null,
  processed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index webhook_events_provider_event_id_idx
  on public.webhook_events (provider_event_id);

create trigger set_webhook_events_updated_at
  before update on public.webhook_events
  for each row execute function public.set_updated_at();

-- Service-role only -- webhook deliveries aren't user-session requests and
-- no client ever reads this table directly. RLS enabled, zero policies:
-- same deny-all-to-authenticated/anon pattern as video_transcripts_cache
-- (supabase/migrations/20260921100013_create_video_transcripts_cache.sql).
alter table public.webhook_events enable row level security;
