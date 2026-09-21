-- Down:
-- drop type if exists tracked_event_type;

-- Backend-Schema.md §4.5. subscriber_milestone and outlier_detected are
-- enum-ready but unimplemented in Phase 1 Task 2 — no logic emits them yet
-- (outlier_detected needs the baseline scanner, explicitly Phase 2;
-- subscriber_milestone wasn't in Task 2's scope either). Adding the values
-- now avoids an enum migration later when their detectors ship.
create type tracked_event_type as enum (
  'new_video',
  'view_spike',
  'cadence_change',
  'subscriber_milestone',
  'outlier_detected'
);
