import { captureException } from "@sentry/nextjs";

import { LOCKOUT_WINDOW_SECONDS } from "@/lib/auth/lockout";
import { getResendClient, SECURITY_FROM_ADDRESS } from "@/lib/email/client";
import { LoginLockEmail, loginLockEmailText } from "@/lib/email/templates/login-lock-email";
import { createServiceClient } from "@/lib/supabase/service";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Security.md §2.4: the owner of a locked email hears about it -- once per
// lockout window (lib/auth/lockout.ts decides that), and only if the
// address has an account, so the lock never becomes a way to email
// arbitrary addresses. Never throws: a failed alert must not break sign-in.
export async function sendLoginLockAlert(email: string): Promise<boolean> {
  const client = getResendClient();
  if (!client) return false;
  try {
    const { data: exists, error: lookupError } = await createServiceClient().rpc(
      "auth_user_exists",
      { p_email: email },
    );
    if (lookupError) throw new Error(`auth_user_exists failed: ${lookupError.message}`);
    if (!exists) return false;

    const minutes = LOCKOUT_WINDOW_SECONDS / 60;
    const resetUrl = `${SITE_URL}/forgot-password`;
    const { error } = await client.emails.send({
      from: SECURITY_FROM_ADDRESS,
      to: email,
      subject: "Password sign-in to your YTNiches account is paused",
      react: LoginLockEmail({ minutes, resetUrl, siteUrl: SITE_URL }),
      text: loginLockEmailText(minutes, resetUrl),
    });
    if (error) throw new Error(`Resend lock alert failed: ${error.message}`);
    return true;
  } catch (cause) {
    captureException(cause);
    return false;
  }
}
