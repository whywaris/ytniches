-- Down:
-- alter table public.notification_preferences drop column if exists digest_day_of_week;

-- UI-UX-Flow.md §6.4's "Weekly digest (email only, day of week selector)" --
-- Backend-Schema.md §4.4 never had a column for it (Phase 2 Task 2 gap 3).
-- 0=Sunday..6=Saturday, default 1 (Monday).
alter table public.notification_preferences
  add column digest_day_of_week smallint not null default 1
  constraint notification_preferences_digest_day_of_week_check
    check (digest_day_of_week between 0 and 6);
