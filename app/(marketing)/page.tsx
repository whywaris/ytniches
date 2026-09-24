import { AiSection } from "@/components/features/landing/ai-section";
import { BentoFeatures } from "@/components/features/landing/bento-features";
import { ChangelogSection } from "@/components/features/landing/changelog-section";
import { SEO } from "@/components/features/landing/content";
import { CreatorExplorer } from "@/components/features/landing/creator-explorer";
import { FinalCta } from "@/components/features/landing/final-cta";
import { FounderSection } from "@/components/features/landing/founder-section";
import { Hero } from "@/components/features/landing/hero";
import { Integrations } from "@/components/features/landing/integrations";
import { ModeToggle } from "@/components/features/landing/mode-toggle";
import { ProblemSection } from "@/components/features/landing/problem-section";
import { TemplatesShowcase } from "@/components/features/landing/templates-showcase";
import { ViewSwitcher } from "@/components/features/landing/view-switcher";
import { VsSection } from "@/components/features/landing/vs-section";

import type { Metadata } from "next";

// Landing-Copy.md §5.4 (title shortened to 58 chars -- approved call E).
export const metadata: Metadata = {
  metadataBase: new URL(SEO.url),
  title: SEO.title,
  description: SEO.description,
  alternates: { canonical: "/" },
  openGraph: { title: SEO.title, description: SEO.description, url: SEO.url, type: "website" },
};

// Monetization.md §2 prices; aggregateRating added once ratings exist.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "YTNiches",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: [
    { "@type": "Offer", name: "Starter", price: "19", priceCurrency: "USD" },
    { "@type": "Offer", name: "Pro", price: "49", priceCurrency: "USD" },
    { "@type": "Offer", name: "Team", price: "99", priceCurrency: "USD" },
  ],
};

// Sections 2-14 (navbar + footer come from the marketing layout). Static.
export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <Hero />
      <ProblemSection />
      <CreatorExplorer />
      <BentoFeatures />
      <ViewSwitcher />
      <TemplatesShowcase />
      <ModeToggle />
      <AiSection />
      <Integrations />
      <FounderSection />
      <ChangelogSection />
      <VsSection />
      <FinalCta />
    </>
  );
}
