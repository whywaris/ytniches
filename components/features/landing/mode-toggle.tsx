"use client";

import * as React from "react";

import { capture } from "@/lib/analytics/client";
import { MODE_TOGGLE } from "@/components/features/landing/content";
import { Ill } from "@/components/features/landing/ill";
import { Section } from "@/components/features/landing/section-heading";
import { SegmentedTabs } from "@/components/features/landing/segmented-tabs";

// Landing-Page-Spec §8 / mode_toggle -- click + keyboard only (drag
// skipped, approved). The toggle sits with the illustration it controls.
function ModeToggle() {
  const [mode, setMode] = React.useState(MODE_TOGGLE.modes[0].id);
  const active = MODE_TOGGLE.modes.find((m) => m.id === mode) ?? MODE_TOGGLE.modes[0];

  return (
    <Section labelledBy="mode-heading">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-body-sm font-medium tracking-wide text-accent-text uppercase">
            {MODE_TOGGLE.eyebrow}
          </p>
          <h2
            id="mode-heading"
            className="text-h1 font-semibold text-text-primary md:text-display-sm"
          >
            {MODE_TOGGLE.headline}
          </h2>
        </div>
        <SegmentedTabs
          options={MODE_TOGGLE.modes}
          value={mode}
          label="Experience mode"
          onValueChange={(next) => {
            setMode(next);
            void capture("landing_beginner_mode_toggled", { mode: next });
          }}
        >
          <div className="grid items-center gap-10 md:grid-cols-2">
            <Ill id={active.ill} className="aspect-[4/3]" />
            <p className="text-body-lg text-text-secondary">{active.copy}</p>
          </div>
        </SegmentedTabs>
      </div>
    </Section>
  );
}

export { ModeToggle };
