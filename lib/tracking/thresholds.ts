// What the activity feed reports (workers/channel-sync.ts). Pure, so the
// help center can show the same numbers.

// A "view milestone" event fires when a video crosses one of these.
export const VIEW_MILESTONES = [1_000, 10_000, 100_000, 1_000_000, 10_000_000];

// An "upload cadence changed" event fires when a channel's average uploads
// per week, over the last CADENCE_WINDOW_WEEKS, moves by at least this much
// between one sync and the next.
export const CADENCE_WINDOW_WEEKS = 4;
export const CADENCE_CHANGE_THRESHOLD_PER_WEEK = 1;
