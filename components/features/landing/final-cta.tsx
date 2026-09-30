import { FINAL_CTA, PRIMARY_CTA } from "@/components/features/landing/content";
import { CtaLink } from "@/components/features/landing/cta-link";
import { SectionHeading } from "@/components/features/landing/section-heading";

// Landing-Page-Spec §14 / D-082: the page's strongest orange glow.
function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="relative overflow-hidden px-6 py-24 md:px-10 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,var(--glow-accent),transparent_60%)] opacity-60"
      />
      <div className="relative mx-auto max-w-[760px] text-center">
        <SectionHeading id="final-cta-heading">{FINAL_CTA.headline}</SectionHeading>
        <p className="mt-4 text-body-lg text-text-secondary">{FINAL_CTA.subhead}</p>
        <div className="mt-10">
          <CtaLink href="/signup" event="landing_final_cta_click">
            {PRIMARY_CTA}
          </CtaLink>
        </div>
      </div>
    </section>
  );
}

export { FinalCta };
