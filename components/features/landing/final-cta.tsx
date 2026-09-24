import { FINAL_CTA } from "@/components/features/landing/content";
import { CtaLink } from "@/components/features/landing/cta-link";

// Landing-Page-Spec §14. "Book a demo" omitted (approved call F). No
// animation -- already at the attention floor.
function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className="border-y border-accent-border bg-accent-subtle px-6 py-24 md:px-10"
    >
      <div className="mx-auto max-w-[800px] text-center">
        <h2
          id="final-cta-heading"
          className="text-h1 font-semibold text-text-primary md:text-display-sm"
        >
          {FINAL_CTA.headline}
        </h2>
        <p className="mt-4 text-body-lg text-text-secondary">{FINAL_CTA.subhead}</p>
        <div className="mt-10">
          <CtaLink href="/signup" event="landing_final_cta_click">
            {FINAL_CTA.primaryCta}
          </CtaLink>
        </div>
        <p className="mt-6 text-body-sm text-text-secondary">{FINAL_CTA.reassurance}</p>
      </div>
    </section>
  );
}

export { FinalCta };
