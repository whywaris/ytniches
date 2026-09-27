import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ConsentLine } from "@/components/features/auth/consent-line";
import { Checkbox } from "@/components/ui/checkbox";
import { TextInput } from "@/components/ui/text-input";
import { signInWithGoogle } from "@/app/(auth)/actions";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — YTNiches",
};

// UI-UX-Flow.md §2.5. Placeholder shell — same constraints as the login
// page (Design-System.md tokens only, Google OAuth is the only wired
// path). Terms checkbox renders per spec but isn't wired as a submit
// gate — that's a product/legal decision for the real signup UX, not
// something to invent here.
export default async function SignupPage({
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
          <h1 className="text-h2 font-semibold text-text-primary">Create your account</h1>
          <p className="text-body-sm text-text-secondary">
            Research + execution for YouTube creators.
          </p>
        </div>

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

        <div className="flex items-center gap-3 text-caption text-text-tertiary">
          <span className="h-px flex-1 bg-border-subtle" />
          or
          <span className="h-px flex-1 bg-border-subtle" />
        </div>

        {/* Shell only — email/password auth not wired (D-015 open). */}
        <form className="space-y-4">
          <TextInput label="Email" type="email" name="email" disabled />
          <TextInput label="Password" type="password" name="password" disabled />
          <label className="flex items-start gap-2 text-body-sm text-text-secondary">
            <Checkbox disabled className="mt-0.5" />I agree to the{" "}
            <Link href="/legal/terms" className="text-accent-text hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/legal/privacy" className="text-accent-text hover:underline">
              Privacy Policy
            </Link>
          </label>
          <Button type="submit" variant="secondary" fullWidth disabled>
            Sign up with email
          </Button>
        </form>

        <p className="text-center text-body-sm text-text-secondary">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-text hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
