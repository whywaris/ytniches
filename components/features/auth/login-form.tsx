"use client";

import * as React from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { resendVerification, signInWithEmail } from "@/app/(auth)/actions";
import { WRONG_CREDENTIALS, type AuthFormState } from "@/lib/auth/forms";
import { Turnstile } from "@/components/features/auth/turnstile";

// Application-Flow.md §3.2 / D-083. The error never says whether the
// account exists; the "Signed up with Google?" hint is static, shown with
// the generic error for everyone.
function LoginForm({ redirectTarget }: { redirectTarget: string | null }) {
  const [state, formAction, pending] = React.useActionState(signInWithEmail, {} as AuthFormState);
  const [resendState, resendAction, resending] = React.useActionState(
    resendVerification,
    {} as AuthFormState,
  );
  const [token, setToken] = React.useState("");

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4" noValidate>
        <TextInput label="Email" type="email" name="email" autoComplete="email" required />
        <TextInput
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          required
        />
        <input type="hidden" name="captchaToken" value={token} />
        <input type="hidden" name="redirect" value={redirectTarget ?? ""} />
        <Turnstile action="login" onToken={setToken} resetKey={state} />

        {state.error ? (
          <div role="alert" className="space-y-1 text-body-sm">
            <p className="text-error">{state.error}</p>
            {state.error === WRONG_CREDENTIALS ? (
              <p className="text-text-secondary">
                Signed up with Google? Use Continue with Google, or{" "}
                <Link href="/forgot-password" className="text-accent-text hover:underline">
                  reset your password
                </Link>{" "}
                to add one.
              </p>
            ) : null}
          </div>
        ) : null}

        <Button type="submit" variant="secondary" fullWidth loading={pending}>
          Log in with email
        </Button>
      </form>

      {state.unverified ? (
        <form action={resendAction} role="alert" className="space-y-2 text-body-sm">
          <p className="text-warning">
            Verify your email first. We sent a link when you signed up.
          </p>
          <input type="hidden" name="captchaToken" value={token} />
          {resendState.sent ? (
            <p className="text-text-secondary">
              If your email still needs verifying, a new link is on its way.
            </p>
          ) : (
            <Button type="submit" size="sm" variant="ghost" loading={resending}>
              Resend the link
            </Button>
          )}
          {resendState.error ? <p className="text-error">{resendState.error}</p> : null}
        </form>
      ) : null}

      <Link
        href="/forgot-password"
        className="block text-center text-body-sm text-accent-text hover:underline"
      >
        Forgot password?
      </Link>
    </div>
  );
}

export { LoginForm };
