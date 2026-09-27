import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ConsentLine } from "@/components/features/auth/consent-line";
import { TextInput } from "@/components/ui/text-input";
import { signInWithGoogle } from "@/app/(auth)/actions";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log in — YTNiches",
};

// UI-UX-Flow.md §2.5. Placeholder shell — Design-System.md tokens only,
// no final layout/illustration. Email/password fields render but aren't
// wired (D-015 is still open); only the Google OAuth path is functional.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const params = await searchParams;
  const redirectTarget = params.redirect ?? null;
  const signInWithGoogleForTarget = signInWithGoogle.bind(null, redirectTarget);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-h2 font-semibold text-text-primary">Log in</h1>
          <p className="text-body-sm text-text-secondary">Welcome back to YTNiches.</p>
        </div>

        {params.error ? (
          <p role="alert" className="text-body-sm text-error">
            Something went wrong signing you in. Please try again.
          </p>
        ) : null}

        <form action={signInWithGoogleForTarget}>
          <Button type="submit" fullWidth>
            Continue with Google
          </Button>
        </form>
        <ConsentLine />

        <div className="flex items-center gap-3 text-caption text-text-tertiary">
          <span className="h-px flex-1 bg-border-subtle" />
          or
          <span className="h-px flex-1 bg-border-subtle" />
        </div>

        {/* Shell only — email/password auth not wired (D-015 open). */}
        <form className="space-y-4">
          <TextInput label="Email" type="email" name="email" disabled />
          <TextInput label="Password" type="password" name="password" disabled />
          <Button type="submit" variant="secondary" fullWidth disabled>
            Log in with email
          </Button>
          <Link
            href="/forgot-password"
            className="block text-center text-body-sm text-accent hover:underline"
          >
            Forgot password?
          </Link>
        </form>

        <p className="text-center text-body-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
