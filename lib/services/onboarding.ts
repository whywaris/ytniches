import { createClient } from "@/lib/supabase/server";
import type { RequestContext } from "@/lib/context";
import type { UpdateProfileInput } from "@/lib/services/onboarding.schema";

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

// UI-UX-Flow.md §3 "Skip behavior": jumps straight to completed (5) and
// stamps onboarding_skipped_at (Backend-Schema.md §2.2) so the dashboard's
// "Finish onboarding" banner can tell a skip apart from a genuine finish,
// which sets step=5 via updateOnboardingStep without ever calling this.
export async function skipOnboarding(ctx: RequestContext): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ onboarding_step: 5, onboarding_skipped_at: new Date().toISOString() })
    .eq("id", ctx.userId);

  if (error) {
    throw new Error(`skipOnboarding update failed: ${error.message}`);
  }
}
