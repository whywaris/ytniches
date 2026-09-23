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
});

describe("UpgradeModal", () => {
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
