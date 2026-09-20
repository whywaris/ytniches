import { describe, expect, it } from "vitest";

import { classifyRoute } from "@/middleware";

describe("classifyRoute", () => {
  it.each([
    ["/", "public"],
    ["/pricing", "public"],
    ["/blog/some-post", "public"],
  ])("classifies %s as %s", (pathname, expected) => {
    expect(classifyRoute(pathname)).toBe(expected);
  });

  it.each([
    ["/login", "auth"],
    ["/signup", "auth"],
    ["/forgot-password", "auth"],
    ["/reset-password", "auth"],
    ["/verify", "auth"],
  ])("classifies %s as %s", (pathname, expected) => {
    expect(classifyRoute(pathname)).toBe(expected);
  });

  it.each([
    ["/dashboard", "app"],
    ["/onboarding", "app"],
    ["/niches", "app"],
    ["/niches/channels/abc123", "app"],
    ["/tracking/compare", "app"],
    ["/settings/billing", "app"],
  ])("classifies %s as %s", (pathname, expected) => {
    expect(classifyRoute(pathname)).toBe(expected);
  });

  it.each([
    ["/admin", "admin"],
    ["/admin/users/abc123", "admin"],
  ])("classifies %s as %s", (pathname, expected) => {
    expect(classifyRoute(pathname)).toBe(expected);
  });

  it("does not false-positive on prefix collisions (e.g. /settings-export)", () => {
    expect(classifyRoute("/settings-export")).toBe("public");
  });
});
