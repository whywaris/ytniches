import Link from "next/link";

import { AuthShell } from "@/components/features/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";
import { LINK_EXPIRED } from "@/lib/auth/forms";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset your password — YTNiches",
};

// Application-Flow.md §3.4. Works for Google accounts too: resetting adds a
// password to the same account (Security.md §2.8).
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to set a new password."
    >
      {params.error === "link_expired" ? (
        <p role="alert" className="text-body-sm text-error">
          {LINK_EXPIRED}
        </p>
      ) : null}
      <ForgotPasswordForm />
      <p className="text-center text-body-sm text-text-secondary">
        Remembered it?{" "}
        <Link href="/login" className="text-accent-text hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
