"use client";

import * as React from "react";

import { Check, Copy } from "lucide-react";

import { capture } from "@/lib/analytics/client";
import type { ToolSlug } from "@/lib/tools/registry";
import { parseChannelInput } from "@/lib/youtube/urls";
import { Button } from "@/components/ui/button";
import { CtaLink } from "@/components/features/landing/cta-link";
import { lookupChannelAction } from "@/app/(marketing)/tools/actions";

export const TOOL_ERROR_COPY: Record<string, string> = {
  busy: "Busy right now. Try again later.",
  rate_limited: "You've used the free limit for now: 10 an hour, 30 a day. Try again later.",
  not_found: "We couldn't find that on YouTube. Check the link and try again.",
  too_old:
    "This video is too old to check. We compare it with the uploads just before it, and we only look at a channel's 50 most recent.",
  not_enough_history:
    "This channel doesn't have enough history yet. We need at least 5 uploads before the video.",
  failed: "Something went wrong on our side. Try again in a minute.",
};

export const CHANNEL_INPUT_HELP =
  "Paste a channel link (youtube.com/@name or /channel/UC…), an @handle or a channel ID. Old /c/ and /user/ links don't work here.";

export function trackToolUsed(slug: ToolSlug) {
  void capture("tool_used", { slug });
}

// Hidden from people and screen readers; bots that fill it get nothing.
export function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      type="text"
      name="company"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="hidden"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function CopyField({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const id = React.useId();
  const field =
    "w-full rounded-sm border border-border-default bg-bg-surface-1 px-3 py-2 font-mono text-body-sm text-text-primary";

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-body-sm font-medium text-text-primary">
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        {multiline ? (
          <textarea id={id} readOnly value={value} rows={8} className={`${field} resize-y`} />
        ) : (
          <input id={id} readOnly value={value} className={`${field} h-9`} />
        )}
        <Button type="button" variant="secondary" onClick={copy} className="shrink-0">
          {copied ? <Check /> : <Copy />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </div>
  );
}

// Every result carries the signup CTA (D-014).
export function ResultCta({ slug }: { slug: ToolSlug }) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-accent-border bg-accent-subtle p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-body-sm text-text-primary">
        Find outliers across whole niches automatically — try YTNiches.
      </p>
      <CtaLink
        href="/signup"
        event="tool_signup_clicked"
        eventProps={{ slug }}
        size="sm"
        className="shrink-0"
      >
        Start free trial
      </CtaLink>
    </div>
  );
}

export type ResolvedChannel = { channelId: string; title?: string };

// Channel IDs resolve instantly in the browser (zero API calls). Only
// @handles go to the server, which is rate-limited and cached.
export function useChannelResolver() {
  const [pending, startTransition] = React.useTransition();

  function resolve(
    query: string,
    company: string,
    done: (result: { ok: true; value: ResolvedChannel } | { ok: false; message: string }) => void,
  ) {
    const parsed = parseChannelInput(query);
    if (!parsed) return done({ ok: false, message: CHANNEL_INPUT_HELP });
    if (parsed.kind === "id") return done({ ok: true, value: { channelId: parsed.id } });

    startTransition(async () => {
      const result = await lookupChannelAction({ query, company });
      done(
        result.ok
          ? { ok: true, value: result.value }
          : {
              ok: false,
              message:
                result.error === "invalid_input"
                  ? CHANNEL_INPUT_HELP
                  : (TOOL_ERROR_COPY[result.error] ?? TOOL_ERROR_COPY.failed),
            },
      );
    });
  }

  return { resolve, pending };
}
