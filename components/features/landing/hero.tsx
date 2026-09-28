import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HERO, HOW_IT_WORKS, PRIMARY_CTA } from "@/components/features/landing/content";
import { CtaLink } from "@/components/features/landing/cta-link";
import { HeroArt } from "@/components/features/landing/illustrations";

// D-082 hero. "See how it works" is a plain anchor (smooth scroll in CSS,
// off under reduced motion) -- no JS.
function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative px-6 pt-12 pb-20 md:px-10 md:pt-20 md:pb-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_70%_0%,var(--glow-accent-soft),transparent_65%)]"
      />
      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h1
            id="hero-heading"
            className="font-display text-[40px] leading-[1.1] font-normal text-balance text-text-primary sm:text-display-sm md:text-display-lg"
          >
            {HERO.headline}
          </h1>
          <p className="mt-6 max-w-xl text-body-lg text-text-secondary">{HERO.subhead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href="/signup" event="landing_hero_cta_click" eventProps={{ source: "hero" }}>
              {PRIMARY_CTA}
            </CtaLink>
            <Button asChild variant="secondary" size="lg">
              <a href={`#${HOW_IT_WORKS.id}`}>{HERO.secondaryCta}</a>
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-body-sm text-text-secondary">
            <ShieldCheck aria-hidden="true" className="size-4 text-accent-text" />
            {HERO.dataLine}
          </p>
        </div>
        <HeroArt className="mx-auto max-w-[560px]" />
      </div>
    </section>
  );
}

export { Hero };
