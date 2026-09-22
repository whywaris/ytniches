import { useState } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { TierCards } from "@/components/features/billing/tier-cards";
import type { BillingFrequency } from "@/lib/billing";

function Controlled({ onSelectTier }: { onSelectTier: (tier: string) => void }) {
  const [frequency, setFrequency] = useState<BillingFrequency>("monthly");
  return (
    <TierCards
      billingFrequency={frequency}
      onBillingFrequencyChange={setFrequency}
      ctaLabel="Continue"
      onSelectTier={onSelectTier}
    />
  );
}

describe("TierCards", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(
      <TierCards
        billingFrequency="monthly"
        onBillingFrequencyChange={vi.fn()}
        ctaLabel="Continue"
        onSelectTier={vi.fn()}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders all three tiers with Pro marked Recommended", () => {
    render(
      <TierCards
        billingFrequency="monthly"
        onBillingFrequencyChange={vi.fn()}
        ctaLabel="Continue"
        onSelectTier={vi.fn()}
      />,
    );
    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("Recommended")).toBeInTheDocument();
  });

  it("shows monthly prices by default", () => {
    render(
      <TierCards
        billingFrequency="monthly"
        onBillingFrequencyChange={vi.fn()}
        ctaLabel="Continue"
        onSelectTier={vi.fn()}
      />,
    );
    expect(screen.getByText("$19")).toBeInTheDocument();
    expect(screen.getByText("$49")).toBeInTheDocument();
    expect(screen.getByText("$99")).toBeInTheDocument();
  });

  it("switches to the per-month-equivalent annual price when Annual is clicked", async () => {
    const user = userEvent.setup();
    const onSelectTier = vi.fn();
    render(<Controlled onSelectTier={onSelectTier} />);

    await user.click(screen.getByRole("button", { name: /Annual/ }));

    // $490/year -> $41/mo equivalent (rounded)
    expect(screen.getByText("$41")).toBeInTheDocument();
    expect(screen.getByText("$490 billed annually")).toBeInTheDocument();
  });

  it("calls onSelectTier with the clicked tier", async () => {
    const user = userEvent.setup();
    const onSelectTier = vi.fn();
    render(
      <TierCards
        billingFrequency="monthly"
        onBillingFrequencyChange={vi.fn()}
        ctaLabel="Continue"
        onSelectTier={onSelectTier}
      />,
    );

    const buttons = screen.getAllByRole("button", { name: "Continue" });
    await user.click(buttons[1]); // Pro is the second card

    expect(onSelectTier).toHaveBeenCalledWith("pro");
  });
});
