"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { resendVerification } from "@/app/(auth)/actions";
import type { AuthFormState } from "@/lib/auth/forms";
import { Turnstile } from "@/components/features/auth/turnstile";

// /check-email's "didn't get it?" (Security.md §2.6: 3 per hour per email;
// over that, the same neutral message and nothing is sent).
function ResendVerificationForm() {
  const [state, formAction, pending] = React.useActionState(
    resendVerification,
    {} as AuthFormState,
  );
  const [token, setToken] = React.useState("");

  if (state.sent) {
    return (
      <p role="status" className="text-body-sm text-text-secondary">
        If your email still needs verifying, a new link is on its way.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="captchaToken" value={token} />
      <Turnstile action="resend" onToken={setToken} resetKey={state} />
      {state.error ? (
        <p role="alert" className="text-body-sm text-error">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" fullWidth loading={pending}>
        Resend the link
      </Button>
    </form>
  );
}

export { ResendVerificationForm };
