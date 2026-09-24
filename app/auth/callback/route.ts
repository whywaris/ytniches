import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/supabase/redirect";
import { getOnboardingStep } from "@/lib/services/onboarding";
import { capture } from "@/lib/analytics";

// Where Google (via Supabase) redirects back to after the OAuth consent
// screen (also the landing spot for an email-verification link -- both of
// Application-Flow.md §3.1's signup branches end at the same
// exchangeCodeForSession call). An explicit ?redirect= is a deep link and
// always wins; otherwise a brand-new or still-onboarding user (step < 5)
// goes to /onboarding, a completed one goes to /dashboard.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const explicitRedirect = searchParams.get("redirect");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    // Admin suspension sets a Supabase Auth ban; sign-in then fails with
    // the user_banned code.
    if (error?.code === "user_banned") {
      return NextResponse.redirect(`${origin}/suspended`);
    }
    if (!error) {
      // First-ever session for this account: created_at and last_sign_in_at
      // land within seconds of each other only on the account's first
      // sign-in (a returning user's are days/weeks apart) -- avoids a
      // schema change just to flag "is this a signup."
      const createdAt = new Date(data.user.created_at).getTime();
      const lastSignInAt = new Date(data.user.last_sign_in_at ?? data.user.created_at).getTime();
      if (Math.abs(lastSignInAt - createdAt) < 60_000) {
        void capture("signup", { distinctId: data.user.id });
      }

      if (explicitRedirect) {
        return NextResponse.redirect(`${origin}${getSafeRedirect(explicitRedirect)}`);
      }
      const step = await getOnboardingStep({
        userId: data.user.id,
        workspaceId: null,
        tier: null,
      });
      return NextResponse.redirect(`${origin}${step < 5 ? "/onboarding" : "/dashboard"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
