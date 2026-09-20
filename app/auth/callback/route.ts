import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/supabase/redirect";

// Where Google (via Supabase) redirects back to after the OAuth consent
// screen. Exchanges the auth code for a session, then continues on to
// wherever the user was originally headed (Application-Flow.md §2.6).
//
// TODO Phase 1: redirect to /onboarding instead of /dashboard once
// onboarding is built (Application-Flow.md §3.1).
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTarget = getSafeRedirect(searchParams.get("redirect"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTarget}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
