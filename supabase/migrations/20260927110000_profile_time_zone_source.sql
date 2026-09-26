-- Down:
-- revoke update (time_zone_source) on public.profiles from authenticated;
-- alter table public.profiles drop column if exists time_zone_source;

-- D-064. time_zone defaults to 'UTC' and nothing ever set it, so "UTC" can't
-- tell "never set" from "chose UTC". This records where the value came from:
--   default -- untouched; the app may fill it from the browser
--   browser -- detected on first app load (never overwritten again)
--   user    -- picked under Settings -> Profile (always wins)
alter table public.profiles
  add column time_zone_source text not null default 'default'
    constraint profiles_time_zone_source_check
    check (time_zone_source in ('default', 'browser', 'user'));

grant update (time_zone_source) on public.profiles to authenticated;
