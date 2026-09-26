import { beforeEach, describe, expect, it, vi } from "vitest";

const update = vi.fn<(values: Record<string, string>) => unknown>();
const eq = vi.fn<(column: string, value: string) => unknown>();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => {
    const builder = {
      update: (values: Record<string, string>) => {
        update(values);
        return builder;
      },
      eq: (column: string, value: string) => {
        eq(column, value);
        return builder;
      },
      then: (resolve: (value: { error: null }) => void) => resolve({ error: null }),
    };
    return { from: () => builder };
  },
}));

const { saveDetectedTimeZone, setTimeZone } = await import("@/lib/services/profile");
const ctx = { userId: "user-1", workspaceId: null, tier: null };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("saveDetectedTimeZone", () => {
  it("only fills in a profile that still has the default zone", async () => {
    expect(await saveDetectedTimeZone(ctx, "Asia/Karachi")).toEqual({ ok: true, value: undefined });
    expect(update).toHaveBeenCalledWith({
      time_zone: "Asia/Karachi",
      time_zone_source: "browser",
    });
    expect(eq).toHaveBeenCalledWith("time_zone_source", "default");
  });

  it("rejects an unknown zone without writing", async () => {
    expect(await saveDetectedTimeZone(ctx, "Nowhere/Land")).toEqual({
      ok: false,
      error: { type: "invalid_time_zone" },
    });
    expect(update).not.toHaveBeenCalled();
  });
});

describe("setTimeZone", () => {
  it("saves the user's choice, marked so detection never replaces it", async () => {
    await setTimeZone(ctx, "UTC");
    expect(update).toHaveBeenCalledWith({ time_zone: "UTC", time_zone_source: "user" });
    expect(eq).not.toHaveBeenCalledWith("time_zone_source", "default");
  });
});
