"use client";

import * as React from "react";

import { AnimatePresence, m } from "framer-motion";
import { Check } from "lucide-react";
import { Tabs as RadixTabs } from "radix-ui";

import { capture } from "@/lib/analytics/client";
import { cn } from "@/lib/utils";
import { CREATOR_EXPLORER, type CreatorType } from "@/components/features/landing/content";
import { Ill } from "@/components/features/landing/ill";
import { Section, SectionHeading } from "@/components/features/landing/section-heading";

function Preview({ type }: { type: CreatorType }) {
  return (
    <div className="grid items-center gap-8 md:grid-cols-5">
      <Ill id={`preview_${type.id}`} className="aspect-[16/10] md:col-span-3" />
      <ul className="space-y-3 md:col-span-2">
        {type.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3 text-body text-text-secondary">
            <Check className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden="true" />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Landing-Page-Spec §4 / creator_type_selector + creator_type_crossfade.
// Radix Tabs = click or left/right arrows to select, aria-selected state
// announced to screen readers (Interaction-Spec §3.6). The strip scrolls
// horizontally with snap on narrow screens (native touch scroll, §3.3).
// ponytail: height isn't layout-animated (that needs framer's domMax
// bundle); panels are fixed-shape so the jump is minimal. Add `layout` +
// domMax if the real preview art varies in height.
function CreatorExplorer() {
  const [selected, setSelected] = React.useState(CREATOR_EXPLORER.types[0].id);
  const active =
    CREATOR_EXPLORER.types.find((type) => type.id === selected) ?? CREATOR_EXPLORER.types[0];

  return (
    <Section labelledBy="creator-heading">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          id="creator-heading"
          eyebrow={CREATOR_EXPLORER.eyebrow}
          headline={CREATOR_EXPLORER.headline}
        />
        <RadixTabs.Root
          value={selected}
          onValueChange={(value) => {
            setSelected(value);
            void capture("landing_creator_type_selected", { type: value });
          }}
        >
          <RadixTabs.List
            aria-label="Creator type"
            className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0"
          >
            {CREATOR_EXPLORER.types.map((type) => (
              <RadixTabs.Trigger
                key={type.id}
                value={type.id}
                className={cn(
                  "min-w-[200px] shrink-0 snap-start rounded-lg border border-border-default bg-bg-surface-1 p-4 text-left outline-none md:min-w-0",
                  "transition-[transform,border-color,background-color] duration-fast ease-out motion-reduce:transition-none",
                  "hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-accent-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
                  "data-[state=active]:scale-[1.02] data-[state=active]:border-accent data-[state=active]:bg-accent-subtle",
                )}
              >
                <span className="block text-body font-medium text-text-primary">{type.label}</span>
                {type.subtitle ? (
                  <span className="mt-1 block text-body-sm text-text-secondary">
                    {type.subtitle}
                  </span>
                ) : null}
              </RadixTabs.Trigger>
            ))}
          </RadixTabs.List>
          <RadixTabs.Content value={selected} className="mt-10 outline-none" tabIndex={-1}>
            <AnimatePresence mode="wait" initial={false}>
              <m.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15, ease: "easeInOut" } }}
                exit={{ opacity: 0, transition: { duration: 0.15, ease: "easeInOut" } }}
              >
                <Preview type={active} />
              </m.div>
            </AnimatePresence>
          </RadixTabs.Content>
        </RadixTabs.Root>
      </div>
    </Section>
  );
}

export { CreatorExplorer };
