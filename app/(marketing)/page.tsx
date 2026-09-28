import { BETA_BANNER, BETA_MODE } from "@/lib/billing/beta";
import { TIER_INFO, TIERS } from "@/lib/billing/plans";
import { SEO } from "@/components/features/landing/content";
import { FaqSection, faqJsonLd } from "@/components/features/landing/faq";
import { FinalCta } from "@/components/features/landing/final-cta";
import { FounderSection } from "@/components/features/landing/founder-section";
import { Hero } from "@/components/features/landing/hero";
import { HowItWorks } from "@/components/features/landing/how-it-works";
import { PricingTeaser } from "@/components/features/landing/pricing-teaser";
import { WhatItDoes } from "@/components/features/landing/what-it-does";

import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(SEO.url),
  title: SEO.title,
  description: SEO.description,
  alternates: { canonical: "/" },
  // A page-level openGraph replaces the inherited one (image included), so
  // name the default card from app/opengraph-image.tsx explicitly.
  openGraph: {
    title: SEO.title,
    description: SEO.description,
    url: SEO.url,
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

// D-081: free during beta -- one $0 offer. Afterwards, the plans' own
// prices from lib/billing/plans.ts (never typed here).
const SOFTWARE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "YTNiches",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: SEO.description,
  offers: BETA_MODE
    ? [
        {
          "@type": "Offer",
          name: "Beta",
          price: "0",
          priceCurrency: "USD",
          description: BETA_BANNER,
        },
      ]
    : TIERS.map((tier) => ({
        "@type": "Offer",
        name: TIER_INFO[tier].label,
        price: String(TIER_INFO[tier].monthlyPrice),
        priceCurrency: "USD",
      })),
};

// D-082 landing: navbar + footer come from the marketing layout. Static.
export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SOFTWARE_JSON_LD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <Hero />
      <WhatItDoes />
      <HowItWorks />
      <FounderSection />
      <PricingTeaser />
      <FaqSection />
      <FinalCta />
    </>
  );
}
