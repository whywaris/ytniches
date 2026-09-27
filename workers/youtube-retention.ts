import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/service";
import { SNAPSHOT_DAILY_RETENTION_DAYS } from "@/lib/discovery/config";
import { YOUTUBE_DATA_MAX_AGE_DAYS, YOUTUBE_RETENTION_EVENT } from "@/lib/youtube/retention";

// D-067b / YouTube Developer Policies III.E.4.d: daily purge of YouTube
// data not refreshed within YOUTUBE_DATA_MAX_AGE_DAYS. The rules (what's
// deleted vs emptied) live in the purge_stale_youtube_data SQL function.
// D-073: the same job covers the Discovery Engine's tables (outliers_feed,
// discovery columns, niche_snapshots rollup) -- there is no second purge.
export async function purgeStaleYouTubeData() {
  const { data, error } = await createServiceClient().rpc("purge_stale_youtube_data", {
    p_max_age_days: YOUTUBE_DATA_MAX_AGE_DAYS,
    p_snapshot_days: SNAPSHOT_DAILY_RETENTION_DAYS,
  });
  if (error) throw new Error(`purgeStaleYouTubeData failed: ${error.message}`);
  return data[0];
}

export const youtubeRetentionCron = inngest.createFunction(
  {
    id: "youtube-retention-cron",
    triggers: [{ cron: "15 3 * * *" }, { event: YOUTUBE_RETENTION_EVENT }],
  },
  async ({ step }) => step.run("purge-stale-youtube-data", purgeStaleYouTubeData),
);
