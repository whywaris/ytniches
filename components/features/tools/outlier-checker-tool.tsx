"use client";

import * as React from "react";

import type { OutlierCheck } from "@/lib/services/free-tools";
import { parseVideoInput } from "@/lib/youtube/urls";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/text-input";
import {
  Honeypot,
  ResultCta,
  TOOL_ERROR_COPY,
  trackToolUsed,
} from "@/components/features/tools/tool-kit";
import { EstimateNote } from "@/components/features/youtube/estimate-note";
import { checkOutlierAction } from "@/app/(marketing)/tools/actions";

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface-1 p-4">
      <dt className="text-caption text-text-secondary">{label}</dt>
      <dd className="mt-1 text-h3 font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function Verdict({ check }: { check: OutlierCheck }) {
  const multiplier = check.multiplier === null ? "—" : `${check.multiplier.toFixed(1)}×`;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-body font-semibold text-text-primary">{check.video.title}</p>
        {check.video.channelTitle && (
          <p className="text-body-sm text-text-secondary">{check.video.channelTitle}</p>
        )}
      </div>
      <p
        role="status"
        className={
          check.isOutlier
            ? "rounded-md border border-success/40 bg-success/12 p-4 text-body font-semibold text-success"
            : "rounded-md border border-border-subtle bg-bg-surface-1 p-4 text-body font-semibold text-text-primary"
        }
      >
        {check.isOutlier
          ? `Outlier. This video has ${multiplier} its channel's recent average.`
          : `Not an outlier. It needs ${check.threshold}× its channel's recent average; it has ${multiplier}.`}
      </p>
      <dl className="grid gap-3 sm:grid-cols-3">
        <Stat label="Video views" value={number.format(check.views)} />
        <Stat label="Channel baseline" value={number.format(check.baseline)} />
        <Stat label="Multiplier" value={multiplier} />
      </dl>
      <p className="text-caption text-text-secondary">
        Baseline = average views of the channel&apos;s last 10 uploads before this video (at least 5
        needed). Outlier at {check.threshold}× or more. Same rule as the YTNiches app.
      </p>
    </div>
  );
}

// Flagship tool (D-014). Server-backed: rate-limited per IP, cached, and
// paused when the day's YouTube quota runs low (D-054).
export function OutlierCheckerTool() {
  const [query, setQuery] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [check, setCheck] = React.useState<OutlierCheck | null>(null);
  const [pending, startTransition] = React.useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!parseVideoInput(query)) {
      setCheck(null);
      setError("Paste a YouTube video link.");
      return;
    }
    startTransition(async () => {
      const result = await checkOutlierAction({ query, company });
      if (result.ok) {
        setError(null);
        setCheck(result.value);
        trackToolUsed("youtube-outlier-checker");
      } else {
        setCheck(null);
        setError(
          result.error === "invalid_input"
            ? "Paste a YouTube video link."
            : (TOOL_ERROR_COPY[result.error] ?? TOOL_ERROR_COPY.failed),
        );
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <TextInput
            label="Video link"
            placeholder="https://www.youtube.com/watch?v=…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            errorMessage={error ?? undefined}
            required
          />
        </div>
        <Honeypot value={company} onChange={setCompany} />
        <Button type="submit" loading={pending} className="sm:mt-6">
          Check
        </Button>
      </form>
      {check && (
        <div className="flex flex-col gap-4">
          <Verdict check={check} />
          <EstimateNote what="The outlier multiple" />
          <ResultCta slug="youtube-outlier-checker" />
        </div>
      )}
    </div>
  );
}
