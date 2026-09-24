import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { TRIAL_CREDITS } from "@/lib/services/billing";
import type { RequestContext } from "@/lib/context";
import type { PrimaryGoal, UpdateProfileInput } from "@/lib/services/onboarding.schema";

export interface OnboardingProfile {
  step: number;
  name: string | null;
  primaryGoal: PrimaryGoal | null;
  skippedAt: string | null;
}

export interface ProfileSummary {
  name: string | null;
  avatarUrl: string | null;
  timeZone: string;
}

// App shell sidebar footer + top-bar avatar (UI-UX-Flow.md §4.1/§4.2), plus
// the dashboard's time-of-day greeting (§4.5) -- timeZone lets that greeting
// reflect the user's own clock instead of the server's UTC.
export async function getProfileSummary(ctx: RequestContext): Promise<ProfileSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("name, avatar_url, time_zone")
    .eq("id", ctx.userId)
    .single();

  if (error) {
    throw new Error(`getProfileSummary query failed: ${error.message}`);
  }
  return { name: data.name, avatarUrl: data.avatar_url, timeZone: data.time_zone };
}

// dashboard/page.tsx: both a skip and a genuine finish set step to 5 --
// skippedAt is the only signal that tells them apart (Backend-Schema.md
// §2.2), so the "Finish onboarding" banner (UI-UX-Flow.md §3) only shows
// for a skip that's still actually incomplete.
export function shouldShowFinishOnboardingBanner(profile: {
  skippedAt: string | null;
  step: number;
}): boolean {
  return profile.skippedAt !== null && profile.step < 5;
}

// Application-Flow.md §3.1 / auth/callback/route.ts: decides whether a
// freshly-authenticated user lands on /onboarding or /dashboard. Every
// authenticated user has exactly one profile row (created by the
// on_auth_user_created trigger at signup), so there's no "not found" case
// to model here.
export async function getOnboardingStep(ctx: RequestContext): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_step")
    .eq("id", ctx.userId)
    .single();

  if (error) {
    throw new Error(`getOnboardingStep query failed: ${error.message}`);
  }
  return data.onboarding_step;
}

// app/onboarding/page.tsx's initial render (Step 1's name pre-fill,
// resuming at the right step) and the dashboard's "Finish onboarding"
// banner (UI-UX-Flow.md §3) -- one query covers both call sites.
export async function getOnboardingProfile(ctx: RequestContext): Promise<OnboardingProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_step, name, primary_goal, onboarding_skipped_at")
    .eq("id", ctx.userId)
    .single();

  if (error) {
    throw new Error(`getOnboardingProfile query failed: ${error.message}`);
  }
  return {
    step: data.onboarding_step,
    name: data.name,
    primaryGoal: data.primary_goal as PrimaryGoal | null,
    skippedAt: data.onboarding_skipped_at,
  };
}

// UI-UX-Flow.md §3: persisted immediately on each step's "Continue" so a
// mid-onboarding refresh resumes at the right screen (Application-Flow.md
// §2.5 -- state lives in the DB, not localStorage/context).
export async function updateOnboardingStep(ctx: RequestContext, step: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_step: step })
    .eq("id", ctx.userId);

  if (error) {
    throw new Error(`updateOnboardingStep update failed: ${error.message}`);
  }
}

// UI-UX-Flow.md §3 Step 1.
export async function updateProfile(ctx: RequestContext, input: UpdateProfileInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ name: input.name, primary_goal: input.primaryGoal })
    .eq("id", ctx.userId);

  if (error) {
    throw new Error(`updateProfile update failed: ${error.message}`);
  }
}

// Monetization.md §1.1/§5.1: every signed-up user gets the 14-day Pro
// trial (no card), whether they walk through onboarding or skip it --
// skipping isn't opting out of the trial, just the guided tour. Shared by
// completeOnboarding() and skipOnboarding() below. Service role for
// subscriptions/credit_events (no authenticated INSERT policy on either --
// Backend-Schema.md §2.3/§2.5). Idempotent: a second call is a no-op,
// guarded by the existing-current-subscription check and, defensively, by
// each insert's own unique-constraint collision (23505) in case of a race.
async function activateTrial(userId: string): Promise<void> {
  const service = createServiceClient();
  const { data: existing, error: existingError } = await service
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("is_current", true)
    .maybeSingle();
  if (existingError) {
    throw new Error(`activateTrial subscription lookup failed: ${existingError.message}`);
  }
  if (existing) return;

  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const { error: insertError } = await service.from("subscriptions").insert({
    user_id: userId,
    tier: "pro",
    status: "trialing",
    provider: "creem",
    current_period_start: now.toISOString(),
    current_period_end: trialEndsAt.toISOString(),
    trial_ends_at: trialEndsAt.toISOString(),
    is_current: true,
  });
  if (insertError) {
    if (insertError.code === "23505") return; // concurrent call already created it
    throw new Error(`activateTrial subscription insert failed: ${insertError.message}`);
  }

  const { error: creditError } = await service.from("credit_events").insert({
    user_id: userId,
    event_type: "allocation",
    amount: TRIAL_CREDITS,
    reason: "14-day trial credits",
    idempotency_key: `trial:${userId}`,
  });
  if (creditError) {
    if (creditError.code === "23505") return; // already granted
    throw new Error(`activateTrial credit grant failed: ${creditError.message}`);
  }
}

// PRD.md §6.4 / Monetization.md §5.1: Step 5's "Save prompts and finish
// setup" -- marks onboarding complete and starts the trial.
export async function completeOnboarding(ctx: RequestContext): Promise<void> {
  const supabase = await createClient();
  const { error: stepError } = await supabase
    .from("profiles")
    .update({ onboarding_step: 5 })
    .eq("id", ctx.userId);
  if (stepError) {
    throw new Error(`completeOnboarding step update failed: ${stepError.message}`);
  }

  await activateTrial(ctx.userId);
}

// UI-UX-Flow.md §3 "Skip behavior": jumps straight to completed (5) and
// stamps onboarding_skipped_at (Backend-Schema.md §2.2) so the dashboard's
// "Finish onboarding" banner can tell a skip apart from a genuine finish.
// Still starts the trial (see activateTrial above) -- skipping the guided
// tour isn't skipping the trial itself.
export async function skipOnboarding(ctx: RequestContext): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_step: 5, onboarding_skipped_at: new Date().toISOString() })
    .eq("id", ctx.userId);

  if (error) {
    throw new Error(`skipOnboarding update failed: ${error.message}`);
  }

  await activateTrial(ctx.userId);
}
