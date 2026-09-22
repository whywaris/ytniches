import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFrom = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: sessionFrom }),
}));

const { getOnboardingStep, updateOnboardingStep, updateProfile, skipOnboarding } =
  await import("@/lib/services/onboarding");

const ctx = { userId: "user-1" };

// A chainable, thenable double for the Supabase query builder: every
// filter method returns the same object, and awaiting it directly resolves
// to `result` -- matching supabase-js's own PostgrestFilterBuilder being a
// thenable. Mirrors tests/lib/services/tracking.test.ts's helper.
function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    update: vi.fn(() => builder),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: typeof result) => void) => resolve(result),
  };
  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getOnboardingStep", () => {
  it("returns the caller's onboarding_step", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: { onboarding_step: 2 }, error: null }),
    );

    const result = await getOnboardingStep(ctx);

    expect(result).toBe(2);
  });

  it("scopes the query to the caller's own row", async () => {
    const builder = makeQueryBuilder({ data: { onboarding_step: 0 }, error: null });
    sessionFrom.mockReturnValueOnce(builder);

    await getOnboardingStep(ctx);

    expect(builder.eq).toHaveBeenCalledWith("id", ctx.userId);
  });

  it("throws on an unexpected query error", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: null, error: { message: "connection reset" } }),
    );

    await expect(getOnboardingStep(ctx)).rejects.toThrow("connection reset");
  });
});

describe("updateOnboardingStep", () => {
  it("persists the given step for the caller's own row", async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    sessionFrom.mockReturnValueOnce(builder);

    await updateOnboardingStep(ctx, 4);

    expect(builder.update).toHaveBeenCalledWith({ onboarding_step: 4 });
    expect(builder.eq).toHaveBeenCalledWith("id", ctx.userId);
  });

  it("throws on an unexpected update error", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: null, error: { message: "constraint violation" } }),
    );

    await expect(updateOnboardingStep(ctx, 1)).rejects.toThrow("constraint violation");
  });
});

describe("updateProfile", () => {
  it("updates name and primary_goal for the caller's own row", async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    sessionFrom.mockReturnValueOnce(builder);

    await updateProfile(ctx, { name: "Ada", primaryGoal: "grower" });

    expect(builder.update).toHaveBeenCalledWith({ name: "Ada", primary_goal: "grower" });
    expect(builder.eq).toHaveBeenCalledWith("id", ctx.userId);
  });

  it("throws on an unexpected update error", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: null, error: { message: "constraint violation" } }),
    );

    await expect(updateProfile(ctx, { name: "Ada", primaryGoal: "grower" })).rejects.toThrow(
      "constraint violation",
    );
  });
});

describe("skipOnboarding", () => {
  it("sets onboarding_step to 5 and stamps onboarding_skipped_at", async () => {
    const builder = makeQueryBuilder({ data: null, error: null });
    sessionFrom.mockReturnValueOnce(builder);

    await skipOnboarding(ctx);

    expect(builder.update).toHaveBeenCalledWith({
      onboarding_step: 5,
      onboarding_skipped_at: expect.any(String),
    });
    expect(builder.eq).toHaveBeenCalledWith("id", ctx.userId);
  });

  it("throws on an unexpected update error", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: null, error: { message: "connection reset" } }),
    );

    await expect(skipOnboarding(ctx)).rejects.toThrow("connection reset");
  });
});
