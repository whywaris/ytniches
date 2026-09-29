"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { updatePassword } from "@/app/(auth)/actions";
import type { AuthFormState } from "@/lib/auth/forms";
import { PasswordRules } from "@/components/features/auth/password-rules";

// Application-Flow.md §3.4: set a new password from a reset link. Saving
// signs out every other session, then goes to the dashboard.
function ResetPasswordForm() {
  const [state, formAction, pending] = React.useActionState(updatePassword, {} as AuthFormState);
  const [password, setPassword] = React.useState("");

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <TextInput
        label="New password"
        type="password"
        name="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        errorMessage={state.fieldErrors?.password}
        aria-describedby="reset-password-rules"
      />
      <PasswordRules id="reset-password-rules" value={password} />
      <TextInput
        label="Confirm new password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        required
        errorMessage={state.fieldErrors?.confirmPassword}
      />
      {state.error ? (
        <p role="alert" className="text-body-sm text-error">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" fullWidth loading={pending}>
        Save new password
      </Button>
    </form>
  );
}

export { ResetPasswordForm };
