import { describe, expect, it } from "vitest";

import { getSafeRedirect } from "@/lib/supabase/redirect";

describe("getSafeRedirect", () => {
  it("allows a same-origin relative path", () => {
    expect(getSafeRedirect("/niches")).toBe("/niches");
  });

  it("falls back when the target is missing", () => {
    expect(getSafeRedirect(null)).toBe("/dashboard");
    expect(getSafeRedirect(undefined)).toBe("/dashboard");
    expect(getSafeRedirect("")).toBe("/dashboard");
  });

  it("rejects absolute URLs to another host (open redirect)", () => {
    expect(getSafeRedirect("https://evil.com")).toBe("/dashboard");
    expect(getSafeRedirect("http://evil.com/phish")).toBe("/dashboard");
  });

  it("rejects protocol-relative URLs (browsers treat // as same-protocol, different host)", () => {
    expect(getSafeRedirect("//evil.com")).toBe("/dashboard");
  });

  it("supports a custom fallback", () => {
    expect(getSafeRedirect(null, "/login")).toBe("/login");
  });
});
