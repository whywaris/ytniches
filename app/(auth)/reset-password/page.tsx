import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/features/auth/auth-shell";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";
import { RECOVERY_COOKIE } from "@/lib/auth/forms";
import { createClient } from "@/lib/supabase/server";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set a new password — YTNiches",
  robots: { index: false },
};

// Application-Flow.md §3.4. Only reachable from a reset link: /auth/confirm
// signs the user in and sets the recovery cookie. A plain signed-in
// session isn't enough to change the password here.
export default async function ResetPasswordPage() {
  const recovering = (await cookies()).get(RECOVERY_COOKIE);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!recovering || !user) redirect("/forgot-password?error=link_expired");

  return (
    <AuthShell title="Set a new password" subtitle="This signs you out on your other devices.">
      <ResetPasswordForm />
    </AuthShell>
  );
}
