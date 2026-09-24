import { CHANGELOG } from "@/components/features/landing/content";
import { Stagger, StaggerItem } from "@/components/features/landing/reveal";
import { Section, SectionHeading } from "@/components/features/landing/section-heading";
import { SoonLink } from "@/components/features/landing/soon-link";

// Landing-Page-Spec §12 / changelog_stagger (60ms, 250ms, 4px). No /changelog
// page yet, so the per-entry "Read more" is dropped and the bottom link
// renders as "Soon" text (approved call B).
function ChangelogSection() {
  return (
    <Section labelledBy="changelog-heading">
      <div className="mx-auto max-w-[1000px]">
        <SectionHeading
          id="changelog-heading"
          eyebrow={CHANGELOG.eyebrow}
          headline={CHANGELOG.headline}
          subhead={CHANGELOG.subhead}
        />
        <Stagger
          as="ul"
          className="divide-y divide-border-subtle border-y border-border-subtle"
          stagger={0.06}
          duration={0.25}
          rise={4}
        >
          {CHANGELOG.entries.map((entry) => (
            <StaggerItem
              key={entry.summary}
              className="flex flex-col gap-1 py-5 sm:flex-row sm:gap-8"
            >
              <span className="w-24 shrink-0 font-mono text-body-sm text-text-secondary">
                {entry.date}
              </span>
              <span className="text-body text-text-primary">{entry.summary}</span>
            </StaggerItem>
          ))}
        </Stagger>
        <div className="mt-6 text-center text-body-sm">
          <SoonLink item={{ label: CHANGELOG.bottomLink, href: null }} />
        </div>
      </div>
    </Section>
  );
}

export { ChangelogSection };
