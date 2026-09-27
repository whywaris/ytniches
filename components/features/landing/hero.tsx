import { HERO } from "@/components/features/landing/content";
import { CtaLink } from "@/components/features/landing/cta-link";
import {
  HeroVideoPoster,
  HeroVideoProvider,
  WatchDemoButton,
} from "@/components/features/landing/hero-video";

// Landing-Page-Spec §2. Social-proof line deliberately omitted until ~250
// users (Landing-Copy §2.2).
function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative -mt-[72px] flex flex-col items-center px-6 pt-40 pb-20 md:min-h-[80vh] md:px-10 lg:min-h-[max(100vh,720px)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(ellipse_at_top,var(--accent-subtle),transparent_65%)]"
      />
      <HeroVideoProvider>
        <div className="relative mx-auto flex max-w-[1120px] flex-col items-center text-center">
          <p className="mb-4 text-body-sm font-medium tracking-wide text-accent-text uppercase">
            {HERO.eyebrow}
          </p>
          <h1
            id="hero-heading"
            className="max-w-4xl text-display-sm font-semibold tracking-tight text-text-primary lg:text-display-lg"
          >
            {HERO.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-body-lg text-text-secondary">{HERO.subhead}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <CtaLink href="/signup" event="landing_hero_cta_click" eventProps={{ cta: "primary" }}>
              {HERO.primaryCta}
            </CtaLink>
            <WatchDemoButton label={HERO.secondaryCta} />
          </div>
          <div className="mt-16 w-full">
            <HeroVideoPoster />
          </div>
        </div>
      </HeroVideoProvider>
    </section>
  );
}

export { Hero };
