"use client";

import * as React from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { signUpWithEmail } from "@/app/(auth)/actions";
import type { AuthFormState } from "@/lib/auth/forms";
import { PasswordRules } from "@/components/features/auth/password-rules";
import { Turnstile } from "@/components/features/auth/turnstile";

// Application-Flow.md §3.1 / D-083. On success the action redirects to
// /check-email; no session (and so no trial or credits) until the email
// is verified.
function SignupForm({ redirectTarget }: { redirectTarget: string | null }) {
  const [state, formAction, pending] = React.useActionState(signUpWithEmail, {} as AuthFormState);
  const [token, setToken] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <TextInput
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        required
        errorMessage={state.fieldErrors?.email}
      />
      <TextInput
        label="Password"
        type="password"
        name="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        errorMessage={state.fieldErrors?.password}
        aria-describedby="signup-password-rules"
      />
      <PasswordRules id="signup-password-rules" value={password} />
      <input type="hidden" name="captchaToken" value={token} />
      <input type="hidden" name="redirect" value={redirectTarget ?? ""} />
      <Turnstile action="signup" onToken={setToken} resetKey={state} />

      {state.exists ? (
        <p role="alert" className="text-body-sm text-text-secondary">
          An account with this email already exists. Continue with Google, or{" "}
          <Link href="/forgot-password" className="text-accent-text hover:underline">
            reset your password
          </Link>
          .
        </p>
      ) : null}
      {state.error ? (
        <p role="alert" className="text-body-sm text-error">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" fullWidth loading={pending}>
        Sign up with email
      </Button>
    </form>
  );
}

export { SignupForm };
