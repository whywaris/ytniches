// YouTube Developer Policies III.E.4.d: Non-Authorized Data (everything we
// fetch with our API key) may be stored for at most 30 days, then it must
// be refreshed or deleted. The sync refreshes tracked channels well inside
// this; workers/youtube-retention.ts purges the rest daily. Passed to the
// SQL, so this is the only copy of the number.
export const YOUTUBE_DATA_MAX_AGE_DAYS = 30;

// Manual trigger for the purge (Admin -> Discovery "Run purge", D-073).
export const YOUTUBE_RETENTION_EVENT = "youtube/retention.requested";

// Shown where a saved prompt's source video has been emptied by the purge.
export const EXPIRED_VIDEO_TITLE = "Video details expired";
