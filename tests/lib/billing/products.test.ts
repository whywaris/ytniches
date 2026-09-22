import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv("CREEM_PRODUCT_ID_STARTER_MONTHLY", "prod_starter_monthly");
  vi.stubEnv("CREEM_PRODUCT_ID_STARTER_YEARLY", "prod_starter_yearly");
  vi.stubEnv("CREEM_PRODUCT_ID_PRO_MONTHLY", "prod_pro_monthly");
  vi.stubEnv("CREEM_PRODUCT_ID_PRO_YEARLY", "prod_pro_yearly");
  vi.stubEnv("CREEM_PRODUCT_ID_TEAM_MONTHLY", "prod_team_monthly");
  vi.stubEnv("CREEM_PRODUCT_ID_TEAM_YEARLY", "prod_team_yearly");
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getProductId", () => {
  it("returns the env-configured product id for each tier/frequency", async () => {
    const { getProductId } = await import("@/lib/billing/products");

    expect(getProductId("starter", "monthly")).toBe("prod_starter_monthly");
    expect(getProductId("pro", "yearly")).toBe("prod_pro_yearly");
    expect(getProductId("team", "monthly")).toBe("prod_team_monthly");
  });
});

describe("getTierForProductId", () => {
  it("reverse-maps a product id to its tier", async () => {
    const { getTierForProductId } = await import("@/lib/billing/products");

    expect(getTierForProductId("prod_pro_yearly")).toBe("pro");
    expect(getTierForProductId("prod_team_monthly")).toBe("team");
  });

  it("returns null for an unknown product id", async () => {
    const { getTierForProductId } = await import("@/lib/billing/products");

    expect(getTierForProductId("prod_totally_unknown")).toBeNull();
  });
});

describe("getProductId with a missing env var", () => {
  it("throws a clear error", async () => {
    vi.stubEnv("CREEM_PRODUCT_ID_STARTER_MONTHLY", "");
    vi.resetModules();
    const { getProductId } = await import("@/lib/billing/products");

    expect(() => getProductId("starter", "monthly")).toThrow(/starter/);
  });
});
