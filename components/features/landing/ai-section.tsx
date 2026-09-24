import { AI_SECTION } from "@/components/features/landing/content";
import { AiDemo } from "@/components/features/landing/ai-demo";
import { Section, SectionHeading } from "@/components/features/landing/section-heading";

// Landing-Page-Spec §9: a darker band than the surrounding page.
function AiSection() {
  return (
    <Section labelledBy="ai-heading" className="border-y border-border-subtle bg-black">
      <div className="mx-auto max-w-[1120px]">
        <SectionHeading
          id="ai-heading"
          eyebrow={AI_SECTION.eyebrow}
          headline={AI_SECTION.headline}
          subhead={AI_SECTION.subhead}
        />
        <div className="grid items-start gap-10 md:grid-cols-2">
          <AiDemo />
          <div>
            <ul className="space-y-5">
              {AI_SECTION.bullets.map((bullet) => (
                <li key={bullet.title} className="text-body text-text-secondary">
                  <strong className="font-semibold text-text-primary">{bullet.title}</strong> —{" "}
                  {bullet.body}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-body-sm text-text-secondary">{AI_SECTION.creditLine}</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

export { AiSection };
