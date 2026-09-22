"use server";

import { getRequestContext } from "@/lib/context";
import { skipOnboarding, updateOnboardingStep, updateProfile } from "@/lib/services/onboarding";
import { UpdateProfileInputSchema, OnboardingStepSchema } from "@/lib/services/onboarding.schema";
import { err, ok, type Result } from "@/lib/result";

// Thin per CLAUDE.md's Server Action pattern (same as tracking/actions.ts,
// niches/actions.ts, prompts/actions.ts): validate input, get the caller's
// context, delegate to the service. No business logic here.

export async function updateOnboardingStepAction(
  step: number,
): Promise<Result<void, { type: "validation_error"; message: string }>> {
  const parsed = OnboardingStepSchema.safeParse(step);
  if (!parsed.success) {
    return err({
      type: "validation_error",
      message: parsed.error.issues[0]?.message ?? "Invalid step.",
    });
  }

  const ctx = await getRequestContext();
  await updateOnboardingStep(ctx, parsed.data);
  return ok(undefined);
}

export async function updateProfileAction(
  name: string,
  primaryGoal: string,
): Promise<Result<void, { type: "validation_error"; message: string }>> {
  const parsed = UpdateProfileInputSchema.safeParse({ name, primaryGoal });
  if (!parsed.success) {
    return err({
      type: "validation_error",
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    });
  }

  const ctx = await getRequestContext();
  await updateProfile(ctx, parsed.data);
  return ok(undefined);
}

export async function skipOnboardingAction(): Promise<void> {
  const ctx = await getRequestContext();
  await skipOnboarding(ctx);
}
