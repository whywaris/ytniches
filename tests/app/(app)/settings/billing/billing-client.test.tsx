import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/toast-provider";
import type { SubscriptionStatus } from "@/lib/services/billing";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const cancelSubscriptionAction = vi.fn();
const getBillingPortalUrlAction = vi.fn();
vi.mock("@/app/(app)/settings/billing/actions", () => ({
  cancelSubscriptionAction: (...args: unknown[]) => cancelSubscriptionAction(...args),
  getBillingPortalUrlAction: (...args: unknown[]) => getBillingPortalUrlAction(...args),
  createCheckoutAction: vi.fn(),
}));

const { BillingClient } = await import("@/app/(app)/settings/billing/billing-client");

const TRIALING: SubscriptionStatus = {
  tier: "pro",
  status: "trialing",
  accountState: "trialing",
  currentPeriodStart: "2026-09-15T00:00:00.000Z",
  currentPeriodEnd: "2026-09-29T00:00:00.000Z",
  trialEndsAt: "2026-09-29T00:00:00.000Z",
  cancelledAt: null,
  providerSubscriptionId: null,
};

const ACTIVE: SubscriptionStatus = {
  tier: "pro",
  status: "active",
  accountState: "active",
  currentPeriodStart: "2026-09-01T00:00:00.000Z",
  currentPeriodEnd: "2026-10-01T00:00:00.000Z",
  trialEndsAt: null,
  cancelledAt: null,
  providerSubscriptionId: "sub_1",
};

function renderClient(subscription: SubscriptionStatus | null, creditsBalance = 100) {
  return render(
    <ToastProvider>
      <BillingClient subscription={subscription} creditsBalance={creditsBalance} />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("BillingClient", () => {
  it("has no accessibility violations with no subscription", async () => {
    const { container } = renderClient(null);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations while trialing", async () => {
    const { container } = renderClient(TRIALING);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows an Upgrade button and no Manage/Cancel buttons with no subscription", () => {
    renderClient(null);
    expect(screen.getByRole("button", { name: "Upgrade" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Manage plan" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel plan" })).not.toBeInTheDocument();
  });

  it("shows the trial state and credits remaining, with no Manage/Cancel buttons", () => {
    renderClient(TRIALING, 42);
    expect(screen.getByText("Trial")).toBeInTheDocument();
    expect(screen.getByText("Free 14-day trial")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Manage plan" })).not.toBeInTheDocument();
  });

  it("shows Manage plan and Cancel plan for an active paid subscription", () => {
    renderClient(ACTIVE);
    expect(screen.getByRole("button", { name: "Manage plan" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel plan" })).toBeInTheDocument();
    // D-051: no self-serve change for paid plans; support does it.
    expect(screen.queryByRole("button", { name: "Change plan" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email us to change plans" })).toHaveAttribute(
      "href",
      "mailto:support@ytniches.com?subject=Change%20my%20plan",
    );
  });

  it("hides the Cancel button once already cancelling", () => {
    renderClient({
      ...ACTIVE,
      accountState: "cancelling",
      cancelledAt: "2026-09-20T00:00:00.000Z",
    });
    expect(screen.queryByRole("button", { name: "Cancel plan" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Manage plan" })).toBeInTheDocument();
  });

  it("confirms before cancelling, then calls the action and shows a success toast", async () => {
    const user = userEvent.setup();
    cancelSubscriptionAction.mockResolvedValueOnce({ ok: true, value: undefined });
    renderClient(ACTIVE);

    await user.click(screen.getByRole("button", { name: "Cancel plan" }));
    expect(cancelSubscriptionAction).not.toHaveBeenCalled(); // dialog open, not confirmed yet

    // The trigger and the dialog's own confirm button now share the label.
    const dialogConfirm = screen.getAllByRole("button", { name: "Cancel plan" }).at(-1)!;
    await user.click(dialogConfirm);

    expect(cancelSubscriptionAction).toHaveBeenCalledOnce();
    expect(
      await screen.findByText("Cancellation scheduled for the end of your billing period"),
    ).toBeInTheDocument();
  });

  it("redirects to the billing portal URL when Manage plan succeeds", async () => {
    const user = userEvent.setup();
    getBillingPortalUrlAction.mockResolvedValueOnce({
      ok: true,
      value: "https://creem.io/my-orders/login/xyz",
    });
    const locationSpy = { href: "" };
    vi.stubGlobal("location", locationSpy);
    renderClient(ACTIVE);

    await user.click(screen.getByRole("button", { name: "Manage plan" }));

    expect(getBillingPortalUrlAction).toHaveBeenCalledOnce();
    expect(locationSpy.href).toBe("https://creem.io/my-orders/login/xyz");
  });

  it("shows an error toast when the billing portal isn't available", async () => {
    const user = userEvent.setup();
    getBillingPortalUrlAction.mockResolvedValueOnce({
      ok: false,
      error: { type: "no_subscription" },
    });
    renderClient(ACTIVE);

    await user.click(screen.getByRole("button", { name: "Manage plan" }));

    expect(await screen.findByText("No billing portal available yet")).toBeInTheDocument();
  });
});
