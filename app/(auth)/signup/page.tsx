import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AuthShell, OrDivider } from "@/components/features/auth/auth-shell";
import { ConsentLine } from "@/components/features/auth/consent-line";
import { SignupForm } from "@/components/features/auth/signup-form";
import { signInWithGoogle } from "@/app/(auth)/actions";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — YTNiches",
};

// UI-UX-Flow.md §2.5 / Application-Flow.md §3.1: Google or email and
// password (D-083). The consent line sits under both ways to create an
// account (D-067c); it replaces the old unwired terms checkbox.
export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirectTarget = params.redirect ?? null;
  const signInWithGoogleForTarget = signInWithGoogle.bind(null, redirectTarget);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Spot rising YouTube channels. Plan what to make next."
    >
      {params.error ? (
        <p role="alert" className="text-body-sm text-error">
          Something went wrong signing you up. Please try again.
        </p>
      ) : null}

      <form action={signInWithGoogleForTarget}>
        <Button type="submit" fullWidth>
          Continue with Google
        </Button>
      </form>
      <ConsentLine />

      <OrDivider />

      <SignupForm redirectTarget={redirectTarget} />
      <ConsentLine />

      <p className="text-center text-body-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-accent-text hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
