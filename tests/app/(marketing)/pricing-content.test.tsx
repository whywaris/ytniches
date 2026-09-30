import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { BETA_NOTICE_LINE, BETA_PRICE } from "@/lib/billing/beta";
import { BETA_PLAN, TIER_INFO, TIERS } from "@/lib/billing/plans";

// D-081 /pricing, in both states: beta (one $0 card + "Plans after beta")
// and after beta (the normal plans), from the same component.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const { PricingContent } = await import("@/app/(marketing)/pricing/pricing-content");

function jsonLdOffers(container: HTMLElement): { name: string; price: string }[] {
  const script = container.querySelector('script[type="application/ld+json"]');
  return (JSON.parse(script?.textContent ?? "{}") as { offers: { name: string; price: string }[] })
    .offers;
}

describe("/pricing during the beta", () => {
  it("leads with one Beta card: $0, free during beta, the beta features, orange Start free", () => {
    render(<PricingContent betaMode />);
    const card = screen.getByRole("heading", { name: "Beta" }).closest("div")!.parentElement!;
    expect(card).toHaveTextContent(`$${BETA_PRICE}`);
    expect(card).toHaveTextContent("Free during beta");
    for (const feature of BETA_PLAN.features) expect(card).toHaveTextContent(feature);
    expect(within(card).getByRole("link", { name: "Start free" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("keeps every paid plan's real price visible under 'Plans after beta', with no buttons", () => {
    render(<PricingContent betaMode />);
    const section = screen.getByRole("region", { name: "Plans after beta" });
    expect(section).toHaveTextContent(BETA_NOTICE_LINE);
    for (const tier of TIERS) {
      expect(
        within(section).getByRole("heading", { name: TIER_INFO[tier].label }),
      ).toBeInTheDocument();
      expect(section).toHaveTextContent(`$${TIER_INFO[tier].monthlyPrice}`);
    }
    expect(within(section).getAllByText("Coming soon")).toHaveLength(TIERS.length);
    const buttons = within(section)
      .getAllByRole("button")
      .map((b) => b.textContent);
    expect(buttons.every((label) => /Monthly|Annual/.test(label ?? ""))).toBe(true);
    expect(screen.queryByRole("button", { name: /Start free trial/ })).not.toBeInTheDocument();
  });

  it("offers only the Beta plan at $0 in its JSON-LD", () => {
    const { container } = render(<PricingContent betaMode />);
    expect(jsonLdOffers(container)).toEqual([
      expect.objectContaining({ name: "Beta", price: String(BETA_PRICE) }),
    ]);
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<PricingContent betaMode />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("/pricing once BETA_MODE is off", () => {
  it("returns to the normal plans, each with Start free trial, and no Beta card", () => {
    render(<PricingContent betaMode={false} />);
    expect(screen.queryByRole("heading", { name: "Beta" })).not.toBeInTheDocument();
    expect(screen.queryByText("Plans after beta")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Start free trial" })).toHaveLength(TIERS.length);
  });

  it("lists the paid plans as offers in its JSON-LD", () => {
    const { container } = render(<PricingContent betaMode={false} />);
    expect(jsonLdOffers(container)).toEqual(
      TIERS.map((tier) =>
        expect.objectContaining({
          name: TIER_INFO[tier].label,
          price: String(TIER_INFO[tier].monthlyPrice),
        }),
      ),
    );
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<PricingContent betaMode={false} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
