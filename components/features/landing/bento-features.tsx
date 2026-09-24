import { Bell, Command, Keyboard, Moon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Tag } from "@/components/ui/tag";
import { BENTO } from "@/components/features/landing/content";
import { DiscoveryPreview } from "@/components/features/landing/discovery-preview";
import { Ill } from "@/components/features/landing/ill";
import { Stagger, StaggerItem } from "@/components/features/landing/reveal";
import { Section, SectionHeading } from "@/components/features/landing/section-heading";

// bento_hover: bg-hover + visible border + 1.02 scale, 150ms, pointer
// devices only; touch gets a brief bg-active on tap (Interaction-Spec §3.3).
const CELL =
  "h-full rounded-xl border border-border-subtle bg-bg-surface-1 p-6 transition-[transform,background-color,border-color] duration-fast ease-out motion-reduce:transition-none " +
  "[@media(hover:hover)]:hover:scale-[1.02] [@media(hover:hover)]:hover:border-border-default [@media(hover:hover)]:hover:bg-bg-hover active:bg-bg-active";

const FILL_ICONS = { cmdk: Command, dark: Moon, keyboard: Keyboard, alerts: Bell } as const;

function CellCopy({
  headline,
  description,
  tags,
}: {
  headline: string;
  description: string;
  tags: string[];
}) {
  return (
    <>
      <h3 className="text-h3 font-semibold text-text-primary">{headline}</h3>
      <p className="mt-2 text-body text-text-secondary">{description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </>
  );
}

// Landing-Page-Spec §5. Cells fade in with a 60ms stagger; DOM order =
// visual reading order so tab order stays logical (§ accessibility).
function BentoFeatures() {
  const { discovery, intelligence, execution, fills } = BENTO;

  return (
    <Section id="features" labelledBy="features-heading">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading id="features-heading" eyebrow={BENTO.eyebrow} headline={BENTO.headline} />
        <Stagger
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-6"
          stagger={0.06}
          duration={0.3}
          rise={8}
        >
          <StaggerItem className="md:col-span-2 lg:col-span-4">
            <div className={CELL}>
              <CellCopy {...discovery} />
              <div className="mt-6">
                <DiscoveryPreview tags={discovery.tags} />
              </div>
            </div>
          </StaggerItem>
          <StaggerItem className="md:col-span-2 lg:col-span-2">
            <div className={CELL}>
              <CellCopy {...intelligence} />
              <Ill id="bento_intelligence" className="mt-6 aspect-square" />
            </div>
          </StaggerItem>
          <StaggerItem className="md:col-span-2 lg:col-span-6">
            <div className={cn(CELL, "grid gap-6 lg:grid-cols-2")}>
              <div>
                <CellCopy {...execution} />
              </div>
              <Ill id="bento_execution" className="aspect-[16/7]" />
            </div>
          </StaggerItem>
          {fills.map((fill) => {
            const Icon = FILL_ICONS[fill.id as keyof typeof FILL_ICONS];
            return (
              <StaggerItem key={fill.id} className="lg:col-span-3">
                <div className={CELL}>
                  <Icon className="size-5 text-accent" aria-hidden="true" />
                  <h3 className="mt-3 text-body font-semibold text-text-primary">{fill.label}</h3>
                  <p className="mt-1 text-body-sm text-text-secondary">{fill.description}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </Section>
  );
}

export { BentoFeatures };
