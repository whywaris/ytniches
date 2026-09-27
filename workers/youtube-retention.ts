import { inngest } from "@/lib/inngest/client";
import { createServiceClient } from "@/lib/supabase/service";
import { YOUTUBE_DATA_MAX_AGE_DAYS } from "@/lib/youtube/retention";

// D-067b / YouTube Developer Policies III.E.4.d: daily purge of YouTube
// data not refreshed within YOUTUBE_DATA_MAX_AGE_DAYS. The rules (what's
// deleted vs emptied) live in the purge_stale_youtube_data SQL function.
export async function purgeStaleYouTubeData() {
  const { data, error } = await createServiceClient().rpc("purge_stale_youtube_data", {
    p_max_age_days: YOUTUBE_DATA_MAX_AGE_DAYS,
  });
  if (error) throw new Error(`purgeStaleYouTubeData failed: ${error.message}`);
  return data[0];
}

export const youtubeRetentionCron = inngest.createFunction(
  { id: "youtube-retention-cron", triggers: [{ cron: "15 3 * * *" }] },
  async ({ step }) => step.run("purge-stale-youtube-data", purgeStaleYouTubeData),
);
