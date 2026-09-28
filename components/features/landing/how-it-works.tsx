import type { ComponentType } from "react";

import { HOW_IT_WORKS, type StepId } from "@/components/features/landing/content";
import { GlassCard } from "@/components/features/landing/glass-card";
import {
  CalendarStepArt,
  NicheStepArt,
  TrackStepArt,
} from "@/components/features/landing/illustrations";
import { SectionHeading } from "@/components/features/landing/section-heading";

const ART: Record<StepId, ComponentType> = {
  niche: NicheStepArt,
  track: TrackStepArt,
  calendar: CalendarStepArt,
};

// The hero's "See how it works" target (scroll-mt clears the sticky navbar).
function HowItWorks() {
  return (
    <section
      id={HOW_IT_WORKS.id}
      aria-labelledby="how-heading"
      className="scroll-mt-24 px-6 py-20 md:px-10 md:py-28"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading id="how-heading" className="text-center">
          {HOW_IT_WORKS.headline}
        </SectionHeading>
        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {HOW_IT_WORKS.steps.map((step, index) => {
            const Art = ART[step.id];
            return (
              <li key={step.id}>
                <GlassCard className="flex h-full flex-col gap-5">
                  <Art />
                  <div>
                    <p className="text-body-sm font-medium text-accent-text">Step {index + 1}</p>
                    <h3 className="mt-1 text-h4 font-semibold text-text-primary">{step.title}</h3>
                    <p className="mt-2 text-body-lg text-text-secondary">{step.line}</p>
                  </div>
                </GlassCard>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export { HowItWorks };
