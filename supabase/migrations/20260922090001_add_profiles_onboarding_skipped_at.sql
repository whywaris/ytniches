-- Down:
-- revoke update (onboarding_skipped_at) on public.profiles from authenticated;
-- alter table public.profiles drop column onboarding_skipped_at;

-- D-033 / Task 4 (Onboarding): distinguishes a skip from a genuine
-- completion. Both set onboarding_step = 5 (Backend-Schema.md §2.2), so
-- this is the only signal the dashboard's "Finish onboarding" banner
-- (UI-UX-Flow.md §3) has to tell them apart. Null = never skipped.
alter table public.profiles
  add column onboarding_skipped_at timestamptz;

-- Session client sets this directly on skip, same as onboarding_step --
-- no service role needed (RLS's existing "users_update_own_profile"
-- policy already scopes this to auth.uid() = id).
grant update (onboarding_skipped_at) on public.profiles to authenticated;
