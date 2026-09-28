import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { PRICING_TEASER } from "@/components/features/landing/content";
import { GlassCard } from "@/components/features/landing/glass-card";
import { SectionHeading } from "@/components/features/landing/section-heading";

function PricingTeaser() {
  return (
    <section aria-labelledby="pricing-heading" className="px-6 py-16 md:px-10 md:py-20">
      <GlassCard className="mx-auto max-w-[760px] px-8 py-12 text-center">
        <SectionHeading id="pricing-heading">{PRICING_TEASER.headline}</SectionHeading>
        <p className="mt-4 text-body-lg text-text-secondary">{PRICING_TEASER.body}</p>
        <Link
          href="/pricing"
          className="mt-6 inline-flex items-center gap-1.5 text-body-lg font-medium text-accent-text hover:underline"
        >
          {PRICING_TEASER.link}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </GlassCard>
    </section>
  );
}

export { PricingTeaser };
