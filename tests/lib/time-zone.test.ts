import { describe, expect, it } from "vitest";

import { isValidTimeZone, listTimeZones, TimeZoneSchema } from "@/lib/time-zone";

describe("time zones", () => {
  it("accepts real IANA names and rejects anything else", () => {
    expect(isValidTimeZone("Asia/Karachi")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
    expect(isValidTimeZone("Mars/Olympus_Mons")).toBe(false);
    expect(TimeZoneSchema.safeParse("'; drop table profiles; --").success).toBe(false);
  });

  it("lists UTC plus the runtime's zones", () => {
    const zones = listTimeZones();
    expect(zones).toContain("UTC");
    expect(zones).toContain("Europe/London");
  });
});
