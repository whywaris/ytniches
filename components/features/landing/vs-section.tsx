import { COMPETITORS, VS } from "@/components/features/landing/content";
import { LIFT } from "@/components/features/landing/lift";
import { Section, SectionHeading } from "@/components/features/landing/section-heading";
import { TrackedLink } from "@/components/features/landing/tracked-link";

// Landing-Page-Spec §13. Card hover: 2px lift + bg lighten.
function VsSection() {
  return (
    <Section id="compare" labelledBy="compare-heading">
      <div className="mx-auto max-w-[1000px]">
        <SectionHeading id="compare-heading" eyebrow={VS.eyebrow} headline={VS.headline} />
        <ul className="grid gap-4 md:grid-cols-3">
          {COMPETITORS.map((competitor) => (
            <li key={competitor.id}>
              <TrackedLink
                href={`/vs/${competitor.id}`}
                event="landing_vs_link_clicked"
                eventProps={{ competitor: competitor.id }}
                className={`flex h-full flex-col rounded-xl border border-border-subtle bg-bg-surface-1 p-6 outline-none hover:bg-bg-hover focus-visible:ring-2 focus-visible:ring-accent-subtle focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base ${LIFT}`}
              >
                <span className="text-h4 font-semibold text-text-primary">
                  YTNiches vs {competitor.name}
                </span>
                <span className="mt-3 flex-1 text-body-sm text-text-secondary">
                  {competitor.framing}
                </span>
                <span className="mt-4 text-body-sm font-medium text-accent">{VS.cardLink}</span>
              </TrackedLink>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-body-sm text-text-secondary">{VS.bottomLine}</p>
      </div>
    </Section>
  );
}

export { VsSection };
