"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import { subscribeAction, type NewsletterState } from "@/app/(marketing)/blog/actions";

// PRD.md §10.2 / UI-UX-Flow.md §2.2 embedded signup. No double opt-in at
// launch (D-053), so the consent line says exactly what people get.
function NewsletterSignup({ heading = "Get new posts by email" }: { heading?: string }) {
  const [state, formAction, pending] = React.useActionState<NewsletterState, FormData>(
    subscribeAction,
    { status: "idle" },
  );
  const headingId = React.useId();

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-md border border-border-subtle bg-bg-surface-1 p-6 md:p-8"
    >
      <h2 id={headingId} className="text-h3 font-semibold text-text-primary">
        {heading}
      </h2>
      <p className="mt-2 text-body text-text-secondary">
        Niches, outliers and what&apos;s working for faceless channels. No fluff.
      </p>

      {state.status === "success" ? (
        <p role="status" className="mt-6 text-body font-medium text-success">
          You&apos;re in. New posts will land in your inbox.
        </p>
      ) : (
        <form action={formAction} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <TextInput
              type="email"
              name="email"
              label="Email address"
              placeholder="you@example.com"
              autoComplete="email"
              required
              errorMessage={state.status === "error" ? state.message : undefined}
            />
          </div>
          {/* Honeypot -- hidden from people and screen readers. */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          <Button type="submit" loading={pending} className="sm:mt-6">
            Subscribe
          </Button>
        </form>
      )}
      <p className="mt-3 text-caption text-text-secondary">
        New posts by email. Unsubscribe anytime.
      </p>
    </section>
  );
}

export { NewsletterSignup };
