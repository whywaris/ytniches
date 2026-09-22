import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/supabase/redirect";
import { getOnboardingStep } from "@/lib/services/onboarding";

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
    if (!error) {
      if (explicitRedirect) {
        return NextResponse.redirect(`${origin}${getSafeRedirect(explicitRedirect)}`);
      }
      const step = await getOnboardingStep({ userId: data.user.id });
      return NextResponse.redirect(`${origin}${step < 5 ? "/onboarding" : "/dashboard"}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
