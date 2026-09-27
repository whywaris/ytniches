import { describe, expect, it, vi } from "vitest";

import { YOUTUBE_DATA_MAX_AGE_DAYS } from "@/lib/youtube/retention";

const rpc = vi.fn<(name: string, args: Record<string, unknown>) => Promise<unknown>>(async () => ({
  data: [{ events_deleted: 2, videos_deleted: 1 }],
  error: null,
}));
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    rpc: (name: string, args: Record<string, unknown>) => rpc(name, args),
  }),
}));

const { purgeStaleYouTubeData } = await import("@/workers/youtube-retention");

describe("purgeStaleYouTubeData", () => {
  it("purges with the 30-day limit from YouTube's Developer Policies (III.E.4.d)", async () => {
    expect(YOUTUBE_DATA_MAX_AGE_DAYS).toBe(30);
    expect(await purgeStaleYouTubeData()).toEqual({ events_deleted: 2, videos_deleted: 1 });
    expect(rpc).toHaveBeenCalledWith("purge_stale_youtube_data", { p_max_age_days: 30 });
  });

  it("fails loudly so Inngest retries", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    await expect(purgeStaleYouTubeData()).rejects.toThrow(/boom/);
  });
});
