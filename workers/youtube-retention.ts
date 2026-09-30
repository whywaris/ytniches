import { captureException } from "@sentry/nextjs";

import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/service";
import { CHANNEL_VIEW_SNAPSHOT_DAYS, NICHE_SNAPSHOT_DAYS } from "@/lib/discovery/config";
import { YOUTUBE_DATA_MAX_AGE_DAYS, YOUTUBE_RETENTION_EVENT } from "@/lib/youtube/retention";

// D-067b / YouTube Developer Policies III.E.4.d: daily purge of YouTube
// data not refreshed within YOUTUBE_DATA_MAX_AGE_DAYS. The rules (what's
// deleted vs emptied) live in the purge_stale_youtube_data SQL function.
// D-073: the same job covers the Discovery Engine's tables (outliers_feed,
// discovery columns, niche_snapshots expiry) -- there is no second purge.

const JOB = "youtube-retention-cron";
const RULE = `YouTube Developer Policies III.E.4.d (${YOUTUBE_DATA_MAX_AGE_DAYS} days)`;
// Postgres foreign_key_violation: a user row (e.g. a prompt, whose FK to
// videos is ON DELETE RESTRICT since D-073) blocked a delete.
const FK_VIOLATION = "23503";

export class YouTubeRetentionError extends Error {
  constructor(
    message: string,
    readonly pgCode: string | null,
    readonly details: string | null,
    readonly hint: string | null,
  ) {
    super(message);
    this.name = "YouTubeRetentionError";
  }
}

// A failed purge means data may outlive the 30-day rule, so it must never
// fail quietly: every failed attempt is reported with the Postgres context
// (grouped into one Sentry issue per code), then rethrown so Inngest retries.
export async function purgeStaleYouTubeData() {
  const { data, error } = await createServiceClient().rpc("purge_stale_youtube_data", {
    p_max_age_days: YOUTUBE_DATA_MAX_AGE_DAYS,
    p_snapshot_days: NICHE_SNAPSHOT_DAYS,
    p_view_snapshot_days: CHANNEL_VIEW_SNAPSHOT_DAYS,
  });
  if (error) {
    const pgCode = error.code || null;
    const reason =
      pgCode === FK_VIOLATION ? "a user row's foreign key blocked a delete" : error.message;
    const failure = new YouTubeRetentionError(
      `purgeStaleYouTubeData failed: ${reason} (${error.message})`,
      pgCode,
      error.details || null,
      error.hint || null,
    );
    captureException(failure, {
      level: "error",
      tags: { job: JOB, pg_code: pgCode ?? "none" },
      extra: {
        rule: RULE,
        details: failure.details,
        hint: failure.hint,
        maxAgeDays: YOUTUBE_DATA_MAX_AGE_DAYS,
        snapshotDays: NICHE_SNAPSHOT_DAYS,
      },
      fingerprint: ["youtube-retention", pgCode ?? "none"],
    });
    throw failure;
  }
  return data[0];
}

// Retries exhausted: the day's purge did not happen. Also catches failures
// that never reached the RPC (timeouts, a crashed worker).
export function reportRetentionGaveUp({ error, runId }: { error: Error; runId: string }) {
  captureException(error, {
    level: "fatal",
    tags: { job: JOB, run_id: runId },
    extra: { rule: RULE, note: "All retries failed; today's purge did not run." },
    fingerprint: ["youtube-retention", "gave-up"],
  });
}

export const youtubeRetentionCron = inngest.createFunction(
  {
    id: JOB,
    triggers: [{ cron: "15 3 * * *" }, { event: YOUTUBE_RETENTION_EVENT }],
    onFailure: ({ error, event }) => reportRetentionGaveUp({ error, runId: event.data.run_id }),
  },
  async ({ step }) => step.run("purge-stale-youtube-data", purgeStaleYouTubeData),
);
