"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/supabase/redirect";

export async function signInWithGoogle(redirectTarget: string | null) {
  const supabase = await createClient();
  const safeTarget = getSafeRedirect(redirectTarget);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback?redirect=${encodeURIComponent(safeTarget)}`,
    },
  });

  if (error || !data?.url) {
    redirect("/login?error=oauth_init_failed");
  }

  redirect(data.url);
}
