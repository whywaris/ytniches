import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { RECOVERY_COOKIE, RECOVERY_MINUTES, SHORT_COOKIE } from "@/lib/auth/forms";
import { postAuthPath } from "@/lib/auth/post-auth";
import { createClient } from "@/lib/supabase/server";

import type { EmailOtpType } from "@supabase/supabase-js";

// D-083: where the verification and password-reset emails land. The
// Supabase templates link here with ?token_hash=...&type=... (plus our own
// ?next=). verifyOtp works in any browser -- unlike the default PKCE link,
// which only works where sign-up started -- and gives the user a session.
// Links expire after 1 hour and work once (Security.md §2.5/§2.6).
const TYPES: EmailOtpType[] = ["signup", "email", "recovery", "email_change"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type && TYPES.includes(type)) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error?.code === "user_banned") return NextResponse.redirect(`${origin}/suspended`);
    if (!error && data.user) {
      if (type === "recovery") {
        (await cookies()).set(RECOVERY_COOKIE, "1", {
          ...SHORT_COOKIE,
          maxAge: RECOVERY_MINUTES * 60,
        });
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      const next = searchParams.get("next") || null;
      return NextResponse.redirect(`${origin}${await postAuthPath(data.user, next)}`);
    }
  }

  const target = type === "recovery" ? "/forgot-password" : "/login";
  return NextResponse.redirect(`${origin}${target}?error=link_expired`);
}
