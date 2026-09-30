"use client";

import * as React from "react";

import {
  estimateRevenue,
  isValidRpm,
  RPM_RANGE,
  viewsToGoal,
  watchTime,
  WATCH_HOURS_GOAL,
} from "@/lib/tools/calculators";
import { FINANCIAL_ESTIMATE_DISCLAIMER } from "@/lib/youtube/estimates";
import { parseStartTime } from "@/lib/youtube/urls";
import { NumberInput } from "@/components/ui/number-input";
import { TextInput } from "@/components/ui/text-input";
import { ResultCta, trackToolUsed } from "@/components/features/tools/tool-kit";

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function useTrackOnce(slug: Parameters<typeof trackToolUsed>[0], ready: boolean) {
  const tracked = React.useRef(false);
  React.useEffect(() => {
    if (ready && !tracked.current) {
      tracked.current = true;
      trackToolUsed(slug);
    }
  }, [ready, slug]);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-subtle bg-bg-surface-1 p-4">
      <dt className="text-caption text-text-secondary">{label}</dt>
      <dd className="mt-1 text-h3 font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function toNumber(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

// Entirely in the browser: views × average view duration.
export function WatchTimeTool() {
  const [views, setViews] = React.useState("");
  const [duration, setDuration] = React.useState("");

  const viewCount = toNumber(views);
  const seconds = duration.trim() ? parseStartTime(duration) : null;
  const durationError =
    duration.trim() && (seconds === null || seconds === 0)
      ? "Use a time like 3:45 or 225."
      : undefined;
  const result = viewCount !== null && seconds ? watchTime(viewCount, seconds) : null;
  useTrackOnce("watch-time-calculator", result !== null);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          label="Views"
          min={0}
          placeholder="120000"
          value={views}
          onChange={(event) => setViews(event.target.value)}
          helperText="Long-form views over the last 12 months."
        />
        <TextInput
          label="Average view duration"
          placeholder="3:45"
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
          errorMessage={durationError}
          helperText={durationError ? undefined : "From YouTube Studio → Analytics."}
        />
      </div>
      {result && (
        <div className="flex flex-col gap-4">
          <dl className="grid gap-3 sm:grid-cols-3">
            <Stat label="Watch hours" value={whole.format(result.hours)} />
            <Stat
              label={`Of ${whole.format(WATCH_HOURS_GOAL)} hours`}
              value={`${result.percentOfGoal.toFixed(1)}%`}
            />
            <Stat label="Hours to go" value={whole.format(result.hoursRemaining)} />
          </dl>
          <p role="status" className="text-body-sm text-text-secondary">
            {result.hoursRemaining === 0
              ? `That's past ${whole.format(WATCH_HOURS_GOAL)} hours. YouTube Studio shows the exact number it counts.`
              : `At this average view duration, that's about ${whole.format(viewsToGoal(result.hours, seconds!) ?? 0)} more views.`}
          </p>
          <ResultCta slug="watch-time-calculator" />
        </div>
      )}
    </div>
  );
}

// The creator's own RPM only -- we never supply "typical" RPMs (D-055).
export function RevenueTool() {
  const [views, setViews] = React.useState("");
  const [rpm, setRpm] = React.useState("");

  const viewCount = toNumber(views);
  const rpmValue = rpm.trim() ? Number(rpm) : null;
  const rpmError =
    rpmValue !== null && !isValidRpm(rpmValue)
      ? `Enter an RPM between $${RPM_RANGE.min} and $${RPM_RANGE.max}.`
      : undefined;
  const revenue =
    viewCount !== null && rpmValue !== null && !rpmError
      ? estimateRevenue(viewCount, rpmValue)
      : null;
  useTrackOnce("youtube-revenue-calculator", revenue !== null);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          label="Views"
          min={0}
          placeholder="50000"
          value={views}
          onChange={(event) => setViews(event.target.value)}
          helperText="For example, last month's views."
        />
        <NumberInput
          label="Your RPM (USD)"
          min={RPM_RANGE.min}
          max={RPM_RANGE.max}
          step={0.01}
          placeholder="Your RPM"
          value={rpm}
          onChange={(event) => setRpm(event.target.value)}
          errorMessage={rpmError}
          helperText={rpmError ? undefined : "YouTube Studio → Analytics → Revenue."}
        />
      </div>
      <p className="rounded-sm border border-border-subtle bg-bg-surface-1 px-3 py-2 text-body-sm font-medium text-text-primary">
        {FINANCIAL_ESTIMATE_DISCLAIMER}
      </p>
      {revenue !== null && (
        <div className="flex flex-col gap-4">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Stat label="Estimated earnings for these views" value={usd.format(revenue)} />
            <Stat label="At this pace for 12 months" value={usd.format(revenue * 12)} />
          </dl>
          <p role="status" className="text-body-sm text-text-secondary">
            Views ÷ 1,000 × your RPM. An estimate: RPM moves month to month.
          </p>
          <ResultCta slug="youtube-revenue-calculator" />
        </div>
      )}
    </div>
  );
}
