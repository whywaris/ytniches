// Shared by the auth server actions (app/(auth)/actions.ts, which may only
// export async functions), the /auth/confirm route and the auth forms.

// D-083 numbers, shared by the code and the help/legal pages (<Fact>).
// Verification and reset links: mirrors Supabase Auth → Email OTP
// expiration (3600 s), one setting for both.
export const AUTH_LINK_EXPIRY_HOURS = 1;
export const PENDING_EMAIL_MINUTES = 30;
export const RECOVERY_MINUTES = 15;
// Security.md §2.4: failures per email, and the lock window.
export const LOCKOUT_MAX_FAILURES = 5;
export const LOCKOUT_WINDOW_SECONDS = 15 * 60;
// Security.md §2.5/§2.6: reset or verification emails per email per hour.
export const AUTH_EMAILS_PER_HOUR = 3;

// The address a sign-up is waiting on, for /check-email's "resend" (kept
// out of the URL). HttpOnly, short-lived.
export const PENDING_EMAIL_COOKIE = "ytn_pending_email";

// Set by /auth/confirm for a password-reset link: /reset-password only
// works inside that window, so a signed-in session alone can't change the
// password.
export const RECOVERY_COOKIE = "ytn_pw_recovery";

export const SHORT_COOKIE = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
} as const;

// One message for every wrong-credentials case, whether or not the account
// exists or has a password (Google-only). The login page shows a static
// "Signed up with Google?" hint below it for everyone (D-083).
export const WRONG_CREDENTIALS = "Email or password is incorrect.";
export const LOCKED = `Too many attempts. Password sign-in for this email is paused for ${LOCKOUT_WINDOW_SECONDS / 60} minutes. You can still continue with Google.`;
export const LINK_EXPIRED = "That link has expired or was already used. Please request a new one.";
export const LINK_VALIDITY = `It works once, for ${AUTH_LINK_EXPIRY_HOURS === 1 ? "1 hour" : `${AUTH_LINK_EXPIRY_HOURS} hours`}.`;

export interface AuthFormState {
  /** A form-level message. */
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password" | "confirmPassword", string>>;
  /** Login: the password was right but the email isn't verified yet. */
  unverified?: boolean;
  /** Sign-up: the email already has an account. */
  exists?: boolean;
  /** Forgot password / resend: the neutral "sent" state. */
  sent?: boolean;
}
