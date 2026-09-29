"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { requestPasswordReset } from "@/app/(auth)/actions";
import { LINK_VALIDITY, type AuthFormState } from "@/lib/auth/forms";
import { Turnstile } from "@/components/features/auth/turnstile";

// Application-Flow.md §3.4 / Security.md §2.5: the same answer whether or
// not the account exists.
function ForgotPasswordForm() {
  const [state, formAction, pending] = React.useActionState(
    requestPasswordReset,
    {} as AuthFormState,
  );
  const [token, setToken] = React.useState("");

  if (state.sent) {
    return (
      <p role="status" className="text-body text-text-secondary">
        If an account with that email exists, we&apos;ve sent a link to reset your password.{" "}
        {LINK_VALIDITY}
      </p>
    );
  }

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
      <input type="hidden" name="captchaToken" value={token} />
      <Turnstile action="reset" onToken={setToken} resetKey={state} />
      {state.error ? (
        <p role="alert" className="text-body-sm text-error">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" fullWidth loading={pending}>
        Send reset link
      </Button>
    </form>
  );
}

export { ForgotPasswordForm };
