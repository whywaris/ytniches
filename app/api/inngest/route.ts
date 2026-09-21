import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest/client";
import { channelSyncFunction } from "@/workers/channel-sync";
import { channelSyncCron } from "@/workers/cron";

// Inngest's local dev server handshake needs all three methods -- exporting
// only POST (the common mistake) breaks function discovery.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [channelSyncFunction, channelSyncCron],
});
