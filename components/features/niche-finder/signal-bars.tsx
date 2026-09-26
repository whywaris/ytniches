import * as React from "react";

import { SCORE_WEIGHTS, type SignalName } from "@/lib/discovery/config";

// Niche-Discovery-Engine.md §9.5: the five signals as bars, each as points
// earned out of its weight (D-071), so the bars add up to the score.

export type NicheSignals = Record<SignalName, number | null>;

const SIGNAL_COPY: Record<SignalName, { label: string; help: string }> = {
  accessibility: { label: "Accessibility", help: "Share of performing channels under 10k subs" },
  demand: { label: "Demand", help: "Median views of videos from the last 90 days" },
  momentum: { label: "Momentum", help: "Share of performing channels started in the last year" },
  outlierDensity: { label: "Outlier density", help: "Share of recent videos at 3x+ their channel" },
  supply: { label: "Low supply", help: "Fewer uploads in the last 30 days scores higher" },
};

function SignalBars({ signals }: { signals: NicheSignals }) {
  return (
    <ul className="space-y-3">
      {(Object.keys(SCORE_WEIGHTS) as SignalName[]).map((name) => {
        const weight = SCORE_WEIGHTS[name];
        const value = signals[name];
        const points = value === null ? null : Math.round(value * weight);
        return (
          <li key={name}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-body-sm font-medium text-text-primary">
                {SIGNAL_COPY[name].label}
              </span>
              <span className="text-caption text-text-secondary tabular-nums">
                {points === null ? "—" : points} / {weight} pts
              </span>
            </div>
            <div
              role="meter"
              aria-label={SIGNAL_COPY[name].label}
              aria-valuemin={0}
              aria-valuemax={weight}
              aria-valuenow={points ?? 0}
              className="mt-1 h-2 overflow-hidden rounded-full bg-bg-surface-2"
            >
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.round((value ?? 0) * 100)}%` }}
              />
            </div>
            <p className="mt-0.5 text-caption text-text-tertiary">{SIGNAL_COPY[name].help}</p>
          </li>
        );
      })}
    </ul>
  );
}

export { SignalBars };
