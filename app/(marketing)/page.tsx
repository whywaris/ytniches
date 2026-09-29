import { softwareJsonLd } from "@/lib/seo/software-json-ld";
import { SEO } from "@/components/features/landing/content";
import { FaqSection, faqJsonLd } from "@/components/features/landing/faq";
import { FinalCta } from "@/components/features/landing/final-cta";
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

// D-082 landing: navbar + footer come from the marketing layout. Static.
export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd(SEO.description)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <Hero />
      <WhatItDoes />
      <HowItWorks />
      <PricingTeaser />
      <FaqSection />
      <FinalCta />
    </>
  );
}
