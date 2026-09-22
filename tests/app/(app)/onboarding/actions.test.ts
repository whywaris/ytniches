import { beforeEach, describe, expect, it, vi } from "vitest";

const getRequestContext = vi.fn();
vi.mock("@/lib/context", () => ({
  getRequestContext: (...args: unknown[]) => getRequestContext(...args),
}));

const updateOnboardingStep = vi.fn();
const updateProfile = vi.fn();
const skipOnboarding = vi.fn();
vi.mock("@/lib/services/onboarding", () => ({
  updateOnboardingStep: (...args: unknown[]) => updateOnboardingStep(...args),
  updateProfile: (...args: unknown[]) => updateProfile(...args),
  skipOnboarding: (...args: unknown[]) => skipOnboarding(...args),
}));

const { updateOnboardingStepAction, updateProfileAction, skipOnboardingAction } =
  await import("@/app/(app)/onboarding/actions");

const ctx = { userId: "user-1" };

beforeEach(() => {
  vi.clearAllMocks();
  getRequestContext.mockResolvedValue(ctx);
});

describe("updateOnboardingStepAction", () => {
  it("gets the request context and delegates to the service", async () => {
    const result = await updateOnboardingStepAction(2);

    expect(getRequestContext).toHaveBeenCalledOnce();
    expect(updateOnboardingStep).toHaveBeenCalledWith(ctx, 2);
    expect(result).toEqual({ ok: true, value: undefined });
  });

  it("rejects a step outside 0-5 without calling the service", async () => {
    const result = await updateOnboardingStepAction(6);

    expect(result.ok).toBe(false);
    expect(getRequestContext).not.toHaveBeenCalled();
    expect(updateOnboardingStep).not.toHaveBeenCalled();
  });

  it("rejects a non-integer step", async () => {
    const result = await updateOnboardingStepAction(2.5);

    expect(result.ok).toBe(false);
    expect(updateOnboardingStep).not.toHaveBeenCalled();
  });
});

describe("updateProfileAction", () => {
  it("gets the request context and delegates to the service", async () => {
    const result = await updateProfileAction("Ada", "grower");

    expect(getRequestContext).toHaveBeenCalledOnce();
    expect(updateProfile).toHaveBeenCalledWith(ctx, { name: "Ada", primaryGoal: "grower" });
    expect(result).toEqual({ ok: true, value: undefined });
  });

  it("rejects an empty name without calling the service", async () => {
    const result = await updateProfileAction("", "grower");

    expect(result.ok).toBe(false);
    expect(getRequestContext).not.toHaveBeenCalled();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it("rejects a primaryGoal outside the four personas", async () => {
    const result = await updateProfileAction("Ada", "hustler");

    expect(result.ok).toBe(false);
    expect(updateProfile).not.toHaveBeenCalled();
  });
});

describe("skipOnboardingAction", () => {
  it("gets the request context and delegates to the service", async () => {
    await skipOnboardingAction();

    expect(getRequestContext).toHaveBeenCalledOnce();
    expect(skipOnboarding).toHaveBeenCalledWith(ctx);
  });
});
