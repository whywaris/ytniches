import { describe, expect, it } from "vitest";

import { labelForPathname } from "@/components/features/shell/nav-config";

describe("labelForPathname", () => {
  it("matches an exact primary nav route", () => {
    expect(labelForPathname("/niches")).toBe("Niche Finder");
  });

  it("matches an exact team nav route", () => {
    expect(labelForPathname("/workspace")).toBe("Workspace");
  });

  it("matches a nested path by longest-prefix", () => {
    expect(labelForPathname("/workspace/tasks")).toBe("Tasks");
    expect(labelForPathname("/tracking/some-channel-id")).toBe("Competitor Tracking");
  });

  it("falls back to 'Settings' for any /settings/* subpath", () => {
    expect(labelForPathname("/settings/billing")).toBe("Settings");
    expect(labelForPathname("/settings/notifications")).toBe("Settings");
  });

  it("title-cases an unknown route's last segment", () => {
    expect(labelForPathname("/invite")).toBe("Invite");
  });

  it("falls back to 'Dashboard' for the root path", () => {
    expect(labelForPathname("/")).toBe("Dashboard");
  });
});
