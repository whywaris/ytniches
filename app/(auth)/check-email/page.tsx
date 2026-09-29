import { cookies } from "next/headers";
import Link from "next/link";

import { AuthShell } from "@/components/features/auth/auth-shell";
import { ResendVerificationForm } from "@/components/features/auth/resend-verification-form";
import { LINK_VALIDITY, PENDING_EMAIL_COOKIE } from "@/lib/auth/forms";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check your email — YTNiches",
  robots: { index: false },
};

// Application-Flow.md §3.1 "check your email". The address comes from a
// short-lived HttpOnly cookie set at sign-up, never from the URL.
export default async function CheckEmailPage() {
  const email = (await cookies()).get(PENDING_EMAIL_COOKIE)?.value;

  return (
    <AuthShell
      title="Check your email"
      subtitle={
        email ? (
          <>
            We sent a verification link to <span className="text-text-primary">{email}</span>.
          </>
        ) : (
          "We sent you a verification link."
        )
      }
    >
      <p className="text-body text-text-secondary">
        Click the link to verify your email and start using YTNiches. {LINK_VALIDITY} Check your
        spam folder if you can&apos;t find it.
      </p>
      {email ? <ResendVerificationForm /> : null}
      <p className="text-center text-body-sm text-text-secondary">
        Wrong address?{" "}
        <Link href="/signup" className="text-accent-text hover:underline">
          Sign up again
        </Link>
      </p>
    </AuthShell>
  );
}
