"use client";

import * as React from "react";

import { capture } from "@/lib/analytics/client";
import { VIEW_SWITCHER } from "@/components/features/landing/content";
import { Ill } from "@/components/features/landing/ill";
import { Section, SectionHeading } from "@/components/features/landing/section-heading";
import { SegmentedTabs } from "@/components/features/landing/segmented-tabs";

// Landing-Page-Spec §6 / view_switcher_crossfade. Default: Grid.
function ViewSwitcher() {
  const [view, setView] = React.useState(VIEW_SWITCHER.views[0].id);
  const active = VIEW_SWITCHER.views.find((v) => v.id === view) ?? VIEW_SWITCHER.views[0];

  return (
    <Section labelledBy="views-heading">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          id="views-heading"
          eyebrow={VIEW_SWITCHER.eyebrow}
          headline={VIEW_SWITCHER.headline}
        />
        <SegmentedTabs
          options={VIEW_SWITCHER.views}
          value={view}
          label="Result view"
          onValueChange={(next) => {
            setView(next);
            void capture("landing_view_type_switched", { view: next });
          }}
        >
          <Ill id={`view_${active.id}`} className="aspect-[16/9]" />
          <p className="mt-4 text-center text-body-sm text-text-secondary">{active.caption}</p>
        </SegmentedTabs>
      </div>
    </Section>
  );
}

export { ViewSwitcher };
