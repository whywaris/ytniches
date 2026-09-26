import { beforeEach, describe, expect, it, vi } from "vitest";

const allocateCycleCredits = vi.fn<
  (userId: string, tier: string, cycleKey: string) => Promise<void>
>(async () => undefined);
vi.mock("@/lib/services/billing", () => ({
  allocateCycleCredits: (userId: string, tier: string, cycleKey: string) =>
    allocateCycleCredits(userId, tier, cycleKey),
}));

let rows: unknown[] = [];
vi.mock("@/lib/supabase/service", () => {
  const builder = {
    select: () => builder,
    eq: () => builder,
    not: () => Promise.resolve({ data: rows, error: null }),
  };
  return { createServiceClient: () => ({ from: () => builder }) };
});

const { allocateAnnualMonthlyCredits, dueAnnualMonth } = await import("@/workers/credit-cycles");
const { monthsElapsed } = await import("@/lib/billing/cycles");

const annual = {
  user_id: "user-1",
  tier: "pro" as const,
  provider_subscription_id: "sub_1",
  current_period_start: "2026-01-31T00:00:00.000Z",
  current_period_end: "2027-01-31T00:00:00.000Z",
};
const monthly = {
  ...annual,
  user_id: "user-2",
  provider_subscription_id: "sub_2",
  current_period_end: "2026-03-02T00:00:00.000Z",
};

function fakeStep() {
  return { run: vi.fn((_id: string, fn: () => Promise<unknown>) => fn()) };
}

beforeEach(() => {
  vi.clearAllMocks();
  rows = [];
});

describe("monthsElapsed", () => {
  it("counts monthly anniversaries, clamping to short months", () => {
    const start = new Date("2026-01-31T00:00:00Z");
    expect(monthsElapsed(start, new Date("2026-02-27T23:59:00Z"))).toBe(0);
    expect(monthsElapsed(start, new Date("2026-02-28T00:00:00Z"))).toBe(1);
    expect(monthsElapsed(start, new Date("2026-12-31T00:00:00Z"))).toBe(11);
  });
});

describe("dueAnnualMonth", () => {
  it("is null in the first month (the webhook allocated it)", () => {
    expect(dueAnnualMonth(annual, new Date("2026-02-10T00:00:00Z"))).toBeNull();
  });

  it("returns months 1-11 of an annual period", () => {
    expect(dueAnnualMonth(annual, new Date("2026-03-01T00:00:00Z"))).toBe(1);
    expect(dueAnnualMonth(annual, new Date("2027-01-15T00:00:00Z"))).toBe(11);
  });

  it("ignores monthly plans and ended periods", () => {
    expect(dueAnnualMonth(monthly, new Date("2026-03-01T00:00:00Z"))).toBeNull();
    expect(dueAnnualMonth(annual, new Date("2027-02-01T00:00:00Z"))).toBeNull();
  });
});

describe("allocateAnnualMonthlyCredits", () => {
  it("allocates each due annual subscriber once per month, with a month-scoped key", async () => {
    rows = [annual, monthly];
    const now = new Date("2026-04-05T00:00:00Z");

    expect(await allocateAnnualMonthlyCredits(fakeStep(), now)).toEqual({ due: 1 });
    expect(allocateCycleCredits).toHaveBeenCalledTimes(1);
    expect(allocateCycleCredits).toHaveBeenCalledWith(
      "user-1",
      "pro",
      "sub_1:2026-01-31T00:00:00.000Z:month-2",
    );
  });

  it("is idempotent across hourly runs: same month, same key", async () => {
    rows = [annual];
    await allocateAnnualMonthlyCredits(fakeStep(), new Date("2026-04-05T00:00:00Z"));
    await allocateAnnualMonthlyCredits(fakeStep(), new Date("2026-04-05T01:00:00Z"));
    const keys = allocateCycleCredits.mock.calls.map((call) => call[2]);
    expect(new Set(keys).size).toBe(1);
  });
});
