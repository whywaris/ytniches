import { createServiceClient } from "@/lib/supabase/service";
import { inngest } from "@/lib/inngest/client";

// TRD.md §4.2: finds channels due for a refresh, one row per channel with
// the fastest cadence any of its trackers asked for (MIN across
// tracked_channels.refresh_cadence_hours). WHERE can't reference the
// aggregate directly, so the cadence/last-synced comparison happens in a
// GROUP BY subquery inside the `find_due_channel_ids` SQL function
// (supabase/migrations/20260921100011).
async function findDueChannelIds(): Promise<string[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.rpc("find_due_channel_ids");

  if (error) {
    throw new Error(`findDueChannelIds failed: ${error.message}`);
  }

  return (data ?? []).map((row) => row.channel_id);
}

interface CronStepTools {
  // `unknown`, not the real Inngest step's generic Jsonify<T> return: this
  // interface exists only to be duck-type-compatible with both the real
  // step object and a plain test double, and a generic method here fails
  // that structural check due to Jsonify's conditional-type variance.
  run: (id: string, fn: () => Promise<string[]> | string[]) => Promise<unknown>;
  sendEvent: (
    id: string,
    events: { name: string; data: Record<string, unknown> }[],
  ) => Promise<unknown>;
}

// The testable core, separate from the Inngest wrapper below (same split as
// workers/channel-sync.ts's syncChannelData/fanOutNotifications).
export async function dispatchDueChannelSyncs(
  step: CronStepTools,
): Promise<{ dispatched: number }> {
  const channelIds = (await step.run("find-due-channels", findDueChannelIds)) as string[];

  if (channelIds.length > 0) {
    // One step.sendEvent call for the whole batch -- atomic (all sent or
    // none, retried together), not a loop of individual inngest.send()
    // calls that could partially succeed.
    await step.sendEvent(
      "dispatch-sync-events",
      channelIds.map((channelId) => ({
        name: "channel/sync.requested",
        data: { channelId },
      })),
    );
  }

  return { dispatched: channelIds.length };
}

export const channelSyncCron = inngest.createFunction(
  { id: "channel-sync-cron", triggers: [{ cron: "0 * * * *" }] },
  async ({ step }) => dispatchDueChannelSyncs(step),
);
