import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/toast-provider";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const createCheckoutAction = vi.fn();
vi.mock("@/app/(app)/settings/billing/actions", () => ({
  createCheckoutAction: (...args: unknown[]) => createCheckoutAction(...args),
}));

const capture = vi.fn();
vi.mock("@/lib/analytics", () => ({
  capture: (...args: unknown[]) => capture(...args),
}));

// D-081: off by default (the paid path); the beta test switches it on.
const beta = vi.hoisted(() => ({
  BETA_MODE: false,
  BETA_BANNER: "Free during beta — paid plans coming soon",
}));
// Every real export, with BETA_MODE switchable per test (same object).
vi.mock("@/lib/billing/beta", async (importOriginal) =>
  Object.assign(beta, { ...(await importOriginal<object>()), BETA_MODE: beta.BETA_MODE }),
);

const { UpgradeModal } = await import("@/components/features/billing/upgrade-modal");

function renderModal(props: Partial<ComponentProps<typeof UpgradeModal>> = {}) {
  return render(
    <ToastProvider>
      <UpgradeModal open onOpenChange={vi.fn()} {...props} />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  beta.BETA_MODE = false;
});

describe("UpgradeModal", () => {
  it("during the beta shows the Beta plan as yours and the paid plans with no way to check out (D-081)", async () => {
    beta.BETA_MODE = true;
    const { baseElement } = renderModal();

    expect(screen.getByRole("heading", { name: "Beta" })).toBeInTheDocument();
    expect(screen.getByText("Your plan")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Plans after beta" })).toBeInTheDocument();
    expect(screen.getAllByText("Coming soon")).toHaveLength(3);
    // Only the monthly/annual toggle is a button -- no plan can be bought.
    expect(screen.getAllByRole("button").map((button) => button.textContent?.trim())).not.toContain(
      "Continue",
    );
    expect(createCheckoutAction).not.toHaveBeenCalled();
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it("has no accessibility violations while open", async () => {
    const { baseElement } = renderModal();
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it("shows the reason line when one is provided", () => {
    renderModal({ reason: "Only 4 credits left." });
    expect(screen.getByText("Only 4 credits left.")).toBeInTheDocument();
  });

  it("creates a checkout session for the clicked tier and navigates to the returned URL", async () => {
    const user = userEvent.setup();
    createCheckoutAction.mockResolvedValueOnce({
      ok: true,
      value: { checkoutUrl: "https://creem.io/pay/ch_1" },
    });
    renderModal();

    const buttons = screen.getAllByRole("button", { name: "Continue" });
    await user.click(buttons[1]); // Pro

    expect(createCheckoutAction).toHaveBeenCalledWith("pro", "monthly");
    expect(push).toHaveBeenCalledWith("https://creem.io/pay/ch_1");
  });

  it("shows an error toast and does not navigate when checkout creation fails", async () => {
    const user = userEvent.setup();
    createCheckoutAction.mockResolvedValueOnce({ ok: false, error: { type: "no_email" } });
    renderModal();

    const buttons = screen.getAllByRole("button", { name: "Continue" });
    await user.click(buttons[0]); // Starter

    expect(await screen.findByText("Couldn't start checkout")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
