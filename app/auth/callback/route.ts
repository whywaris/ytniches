import { NextResponse } from "next/server";

import { postAuthPath } from "@/lib/auth/post-auth";
import { createClient } from "@/lib/supabase/server";

// Where Google (via Supabase) redirects back to after the OAuth consent
// screen. Email links land on /auth/confirm instead (D-083). Both end in
// lib/auth/post-auth.ts: an explicit ?redirect= wins, otherwise onboarding
// or the dashboard.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    // Admin suspension sets a Supabase Auth ban; sign-in then fails with
    // the user_banned code.
    if (error?.code === "user_banned") {
      return NextResponse.redirect(`${origin}/suspended`);
    }
    if (!error) {
      const path = await postAuthPath(data.user, searchParams.get("redirect"));
      return NextResponse.redirect(`${origin}${path}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
