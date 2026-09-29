import { BETA_BANNER, BETA_MODE, BETA_PRICE } from "@/lib/billing/beta";
import { TIER_INFO, TIERS } from "@/lib/billing/plans";

// schema.org SoftwareApplication for / and /pricing. D-081: during the
// beta the only offer is the Beta plan at $0 -- the paid plans aren't
// purchasable, so they aren't listed as offers. Once BETA_MODE is off the
// plans' own prices come back automatically. Numbers come from constants.
export function softwareJsonLd(description: string, betaMode: boolean = BETA_MODE) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "YTNiches",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    offers: betaMode
      ? [
          {
            "@type": "Offer",
            name: "Beta",
            price: String(BETA_PRICE),
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
}
