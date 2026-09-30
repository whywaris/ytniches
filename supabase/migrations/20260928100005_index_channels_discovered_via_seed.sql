-- Down:
-- drop index if exists public.channels_discovered_via_seed_idx;

-- Supabase advisor (unindexed_foreign_keys) after the discovery migrations:
-- deleting a seed sets channels.discovered_via_seed to null, which scans
-- channels without this index.
create index if not exists channels_discovered_via_seed_idx
  on public.channels (discovered_via_seed);
