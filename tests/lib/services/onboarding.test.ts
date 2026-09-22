import { beforeEach, describe, expect, it, vi } from "vitest";

const sessionFrom = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: sessionFrom }),
}));

const serviceFrom = vi.fn();
vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({ from: serviceFrom }),
}));

const {
  getOnboardingStep,
  getOnboardingProfile,
  updateOnboardingStep,
  updateProfile,
  skipOnboarding,
  completeOnboarding,
  shouldShowFinishOnboardingBanner,
} = await import("@/lib/services/onboarding");

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
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    insert: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: typeof result) => void) => resolve(result),
  };
  return builder;
}

// activateTrial's happy path: no existing current subscription, then both
// inserts succeed. Queued in the order activateTrial calls them.
function mockActivateTrialSuccess() {
  serviceFrom
    .mockReturnValueOnce(makeQueryBuilder({ data: null, error: null })) // existing-subscription check
    .mockReturnValueOnce(makeQueryBuilder({ data: null, error: null })) // subscription insert
    .mockReturnValueOnce(makeQueryBuilder({ data: null, error: null })); // credit_events insert
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

describe("getOnboardingProfile", () => {
  it("maps the row to the OnboardingProfile shape", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({
        data: {
          onboarding_step: 2,
          name: "Ada",
          primary_goal: "grower",
          onboarding_skipped_at: null,
        },
        error: null,
      }),
    );

    const result = await getOnboardingProfile(ctx);

    expect(result).toEqual({
      step: 2,
      name: "Ada",
      primaryGoal: "grower",
      skippedAt: null,
    });
  });

  it("scopes the query to the caller's own row", async () => {
    const builder = makeQueryBuilder({
      data: { onboarding_step: 0, name: null, primary_goal: null, onboarding_skipped_at: null },
      error: null,
    });
    sessionFrom.mockReturnValueOnce(builder);

    await getOnboardingProfile(ctx);

    expect(builder.eq).toHaveBeenCalledWith("id", ctx.userId);
  });

  it("throws on an unexpected query error", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: null, error: { message: "connection reset" } }),
    );

    await expect(getOnboardingProfile(ctx)).rejects.toThrow("connection reset");
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
    mockActivateTrialSuccess();

    await skipOnboarding(ctx);

    expect(builder.update).toHaveBeenCalledWith({
      onboarding_step: 5,
      onboarding_skipped_at: expect.any(String),
    });
    expect(builder.eq).toHaveBeenCalledWith("id", ctx.userId);
  });

  it("also starts the trial -- skipping the tour isn't skipping the trial", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));
    mockActivateTrialSuccess();

    await skipOnboarding(ctx);

    expect(serviceFrom).toHaveBeenCalledTimes(3);
  });

  it("throws on an unexpected update error", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: null, error: { message: "connection reset" } }),
    );

    await expect(skipOnboarding(ctx)).rejects.toThrow("connection reset");
  });
});

describe("completeOnboarding", () => {
  it("sets onboarding_step to 5 and starts the trial", async () => {
    const profileBuilder = makeQueryBuilder({ data: null, error: null });
    sessionFrom.mockReturnValueOnce(profileBuilder);
    mockActivateTrialSuccess();

    await completeOnboarding(ctx);

    expect(profileBuilder.update).toHaveBeenCalledWith({ onboarding_step: 5 });
  });

  it("inserts a trialing pro subscription with the trial credit grant", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));
    const existingCheck = makeQueryBuilder({ data: null, error: null });
    const subscriptionInsert = makeQueryBuilder({ data: null, error: null });
    const creditInsert = makeQueryBuilder({ data: null, error: null });
    serviceFrom
      .mockReturnValueOnce(existingCheck)
      .mockReturnValueOnce(subscriptionInsert)
      .mockReturnValueOnce(creditInsert);

    await completeOnboarding(ctx);

    expect(subscriptionInsert.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: ctx.userId,
        tier: "pro",
        status: "trialing",
        provider: "creem",
        is_current: true,
      }),
    );
    expect(creditInsert.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: ctx.userId,
        event_type: "allocation",
        amount: 50,
        idempotency_key: `trial:${ctx.userId}`,
      }),
    );
  });

  it("is a no-op if the user already has a current subscription", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));
    serviceFrom.mockReturnValueOnce(makeQueryBuilder({ data: { id: "sub-1" }, error: null }));

    await completeOnboarding(ctx);

    expect(serviceFrom).toHaveBeenCalledTimes(1); // only the existing-subscription check
  });

  it("treats a duplicate subscription insert as a concurrent-call race, not an error", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));
    serviceFrom
      .mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }))
      .mockReturnValueOnce(
        makeQueryBuilder({ data: null, error: { message: "duplicate", code: "23505" } }),
      );

    await expect(completeOnboarding(ctx)).resolves.toBeUndefined();
  });

  it("throws on an unexpected subscription insert error", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));
    serviceFrom
      .mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }))
      .mockReturnValueOnce(
        makeQueryBuilder({ data: null, error: { message: "connection reset" } }),
      );

    await expect(completeOnboarding(ctx)).rejects.toThrow("connection reset");
  });
});

describe("shouldShowFinishOnboardingBanner", () => {
  it("shows for a skipped, still-incomplete user", () => {
    expect(shouldShowFinishOnboardingBanner({ skippedAt: "2026-09-22T00:00:00Z", step: 2 })).toBe(
      true,
    );
  });

  it("hides once the user reaches step 5, even if they skipped", () => {
    expect(shouldShowFinishOnboardingBanner({ skippedAt: "2026-09-22T00:00:00Z", step: 5 })).toBe(
      false,
    );
  });

  it("hides for a user who never skipped", () => {
    expect(shouldShowFinishOnboardingBanner({ skippedAt: null, step: 2 })).toBe(false);
  });
});
