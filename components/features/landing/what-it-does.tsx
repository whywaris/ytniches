import type { ComponentType } from "react";

import { WHAT_IT_DOES, type IllustrationId } from "@/components/features/landing/content";
import { GlassCard } from "@/components/features/landing/glass-card";
import { FindArt, PlanArt, UnderstandArt } from "@/components/features/landing/illustrations";
import { SectionHeading } from "@/components/features/landing/section-heading";

const ART: Record<IllustrationId, ComponentType> = {
  find: FindArt,
  understand: UnderstandArt,
  plan: PlanArt,
};

function WhatItDoes() {
  return (
    <section aria-labelledby="what-heading" className="px-6 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading id="what-heading" className="text-center">
          {WHAT_IT_DOES.headline}
        </SectionHeading>
        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {WHAT_IT_DOES.items.map((item) => {
            const Art = ART[item.id];
            return (
              <li key={item.id}>
                <GlassCard className="flex h-full flex-col gap-5">
                  <Art />
                  <div>
                    <h3 className="text-h4 font-semibold text-text-primary">{item.title}</h3>
                    <p className="mt-2 text-body-lg text-text-secondary">{item.line}</p>
                  </div>
                </GlassCard>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export { WhatItDoes };
