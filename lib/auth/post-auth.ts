import { capture } from "@/lib/analytics";
import { getOnboardingStep } from "@/lib/services/onboarding";
import { getSafeRedirect } from "@/lib/supabase/redirect";

import type { User } from "@supabase/supabase-js";

// Where a user goes once they have a session -- the same for Google
// (/auth/callback), a verified email link (/auth/confirm) and a password
// sign-in. An explicit ?redirect= is a deep link and always wins;
// otherwise a user still onboarding (step < 5) goes to /onboarding, a
// finished one to /dashboard.
export async function postAuthPath(user: User, explicitRedirect: string | null): Promise<string> {
  // First-ever session: created_at and last_sign_in_at land within seconds
  // of each other only on the account's first sign-in -- avoids a schema
  // change just to flag "is this a signup".
  const createdAt = new Date(user.created_at).getTime();
  const lastSignInAt = new Date(user.last_sign_in_at ?? user.created_at).getTime();
  if (Math.abs(lastSignInAt - createdAt) < 60_000) {
    void capture("signup", { distinctId: user.id });
  }

  if (explicitRedirect) return getSafeRedirect(explicitRedirect);
  const step = await getOnboardingStep({ userId: user.id, workspaceId: null, tier: null });
  return step < 5 ? "/onboarding" : "/dashboard";
}
