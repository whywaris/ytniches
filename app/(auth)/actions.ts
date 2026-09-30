"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { isAuthWeakPasswordError, type AuthError } from "@supabase/supabase-js";
import { z } from "zod";

import { emailSchema, passwordSchema } from "@/lib/auth/credentials";
import {
  LOCKED,
  PENDING_EMAIL_MINUTES,
  PENDING_EMAIL_COOKIE,
  RECOVERY_COOKIE,
  SHORT_COOKIE,
  WRONG_CREDENTIALS,
  type AuthFormState,
} from "@/lib/auth/forms";
import { allowAuthEmail, clearFailures, isLocked, recordFailure } from "@/lib/auth/lockout";
import { postAuthPath } from "@/lib/auth/post-auth";
import { sendLoginLockAlert } from "@/lib/email/security";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/supabase/redirect";

// Application-Flow.md §3 / Security.md §2 / D-083. Google OAuth plus email
// and password. Every password flow carries a Cloudflare Turnstile token,
// which Supabase Auth checks server-side (its built-in CAPTCHA).

const SITE_URL = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Supabase Auth error codes (https://supabase.com/docs/guides/auth/debugging/error-codes)
// that every password flow maps the same way.
function commonAuthError(code: string | undefined): string | null {
  switch (code) {
    case "captcha_failed":
      return "We couldn't confirm you're human. Please try again.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Please wait a few minutes and try again.";
    default:
      return null;
  }
}

function weakPasswordMessage(error: AuthError): string {
  if (isAuthWeakPasswordError(error) && error.reasons.includes("pwned")) {
    return "This password has appeared in a data breach. Please choose a different one.";
  }
  return "Use at least 12 characters, with a lowercase letter, an uppercase letter and a number.";
}

function fieldError<T extends z.ZodTypeAny>(schema: T, value: unknown): string | undefined {
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0]?.message;
}

const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

// --- Google ------------------------------------------------------------------

export async function signInWithGoogle(redirectTarget: string | null) {
  const supabase = await createClient();
  const safeTarget = getSafeRedirect(redirectTarget);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${SITE_URL()}/auth/callback?redirect=${encodeURIComponent(safeTarget)}`,
    },
  });

  if (error || !data?.url) {
    redirect("/login?error=oauth_init_failed");
  }

  redirect(data.url);
}

// --- Sign up -----------------------------------------------------------------

// Where the verification link lands. The Supabase email template appends
// token_hash and type to it ({{ .RedirectTo }}&token_hash=...&type=email).
function confirmUrl(next: string): string {
  return `${SITE_URL()}/auth/confirm?next=${encodeURIComponent(next)}`;
}

export async function signUpWithEmail(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = text(formData, "email");
  const password = text(formData, "password");
  const fieldErrors = {
    email: fieldError(emailSchema, email),
    password: fieldError(passwordSchema, password),
  };
  if (fieldErrors.email || fieldErrors.password) return { fieldErrors };

  const normalizedEmail = emailSchema.parse(email);
  const next = getSafeRedirect(text(formData, "redirect") || null, "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: confirmUrl(next),
      captchaToken: text(formData, "captchaToken") || undefined,
    },
  });

  if (error) {
    const common = commonAuthError(error.code);
    if (common) return { error: common };
    if (error.code === "weak_password") {
      return {
        fieldErrors: {
          password: weakPasswordMessage(error),
        },
      };
    }
    if (error.code === "email_address_invalid") {
      return { fieldErrors: { email: "Enter a valid email address." } };
    }
    return { error: "Something went wrong creating your account. Please try again." };
  }

  // D-083 (owner's call): sign-up alone may say an account exists. Supabase
  // hides it by returning a user with no identities instead of an error.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    return { exists: true };
  }

  (await cookies()).set(PENDING_EMAIL_COOKIE, normalizedEmail, {
    ...SHORT_COOKIE,
    maxAge: PENDING_EMAIL_MINUTES * 60,
  });
  redirect("/check-email");
}

export async function resendVerification(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = (await cookies()).get(PENDING_EMAIL_COOKIE)?.value;
  if (!email) return { error: "Your sign-up session expired. Please sign up again." };

  // Over the per-email limit: same neutral answer, nothing sent.
  if (!(await allowAuthEmail("verify", email))) return { sent: true };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: confirmUrl(""),
      captchaToken: text(formData, "captchaToken") || undefined,
    },
  });
  const common = commonAuthError(error?.code);
  if (common) return { error: common };
  return { sent: true };
}

// --- Log in ------------------------------------------------------------------

export async function signInWithEmail(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsedEmail = emailSchema.safeParse(text(formData, "email"));
  const password = text(formData, "password");
  if (!parsedEmail.success || !password) return { error: WRONG_CREDENTIALS };
  const email = parsedEmail.data;

  // Checked before Supabase: a locked email never reaches the password check.
  if (await isLocked(email)) return { error: LOCKED };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken: text(formData, "captchaToken") || undefined },
  });

  if (error) {
    const common = commonAuthError(error.code);
    if (common) return { error: common };
    if (error.code === "user_banned") redirect("/suspended");
    // Supabase checks the password before confirmation, so this only
    // happens when the password was right.
    if (error.code === "email_not_confirmed") {
      (await cookies()).set(PENDING_EMAIL_COOKIE, email, {
        ...SHORT_COOKIE,
        maxAge: PENDING_EMAIL_MINUTES * 60,
      });
      return { unverified: true };
    }
    const failure = await recordFailure(email);
    if (failure.sendAlert) void sendLoginLockAlert(email);
    return { error: failure.locked ? LOCKED : WRONG_CREDENTIALS };
  }

  await clearFailures(email);
  redirect(await postAuthPath(data.user, text(formData, "redirect") || null));
}

// --- Forgot / reset password -------------------------------------------------

export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = emailSchema.safeParse(text(formData, "email"));
  if (!parsed.success) return { fieldErrors: { email: "Enter a valid email address." } };

  // Security.md §2.5: the answer never reveals whether the account exists,
  // and over the per-email limit nothing is sent.
  if (!(await allowAuthEmail("reset", parsed.data))) return { sent: true };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: confirmUrl("/reset-password"),
    captchaToken: text(formData, "captchaToken") || undefined,
  });
  // Only a failed CAPTCHA is worth saying; anything else stays neutral.
  if (error?.code === "captcha_failed") return { error: commonAuthError(error.code)! };
  return { sent: true };
}

export async function updatePassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const cookieStore = await cookies();
  if (!cookieStore.get(RECOVERY_COOKIE)) {
    return { error: "This reset link has expired. Please request a new one." };
  }

  const password = text(formData, "password");
  const passwordError = fieldError(passwordSchema, password);
  if (passwordError) return { fieldErrors: { password: passwordError } };
  if (password !== text(formData, "confirmPassword")) {
    return { fieldErrors: { confirmPassword: "The passwords don't match." } };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === "same_password") {
      return { fieldErrors: { password: "Choose a password you haven't used before." } };
    }
    if (error.code === "weak_password") {
      return {
        fieldErrors: {
          password: weakPasswordMessage(error),
        },
      };
    }
    return { error: "This reset link has expired. Please request a new one." };
  }

  // Security.md §2.5: a password change signs out every other session.
  await supabase.auth.signOut({ scope: "others" });
  cookieStore.delete(RECOVERY_COOKIE);
  redirect("/dashboard");
}
