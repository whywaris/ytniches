import Link from "next/link";

import { Button } from "@/components/ui/button";
import { AuthShell, OrDivider } from "@/components/features/auth/auth-shell";
import { ConsentLine } from "@/components/features/auth/consent-line";
import { LoginForm } from "@/components/features/auth/login-form";
import { signInWithGoogle } from "@/app/(auth)/actions";
import { LINK_EXPIRED } from "@/lib/auth/forms";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in — YTNiches",
};

// UI-UX-Flow.md §2.5 / Application-Flow.md §3.2: Google or email and
// password (D-015 resolved by D-083).
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirectTarget = params.redirect ?? null;
  const signInWithGoogleForTarget = signInWithGoogle.bind(null, redirectTarget);

  return (
    <AuthShell title="Log in" subtitle="Welcome back to YTNiches.">
      {params.error ? (
        <p role="alert" className="text-body-sm text-error">
          {params.error === "link_expired"
            ? LINK_EXPIRED
            : "Something went wrong signing you in. Please try again."}
        </p>
      ) : null}

      <form action={signInWithGoogleForTarget}>
        <Button type="submit" fullWidth>
          Continue with Google
        </Button>
      </form>
      <ConsentLine />

      <OrDivider />

      <LoginForm redirectTarget={redirectTarget} />

      <p className="text-center text-body-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-accent-text hover:underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
