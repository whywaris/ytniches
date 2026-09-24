import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/toast-provider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/users/user-1",
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const grantCreditsAction = vi.fn();
vi.mock("@/app/(admin)/admin/users/[userId]/actions", () => ({
  grantCreditsAction: (...args: unknown[]) => grantCreditsAction(...args),
  suspendUserAction: vi.fn(),
  unsuspendUserAction: vi.fn(),
  getRefundPreviewAction: vi.fn(),
  refundLastPaymentAction: vi.fn(),
}));

const { AdminNav } = await import("@/components/features/admin/admin-nav");
const { UserActions } = await import("@/app/(admin)/admin/users/[userId]/user-actions");

describe("AdminNav", () => {
  it("marks the current module and has no axe violations", async () => {
    const { container } = render(<AdminNav />);
    expect(screen.getByRole("link", { name: "Users" })).toHaveAttribute("aria-current", "page");
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("UserActions", () => {
  function renderActions() {
    return render(
      <ToastProvider>
        <UserActions userId="user-1" suspended={false} hasPaidSubscription />
      </ToastProvider>,
    );
  }

  it("has no axe violations", async () => {
    const { container } = renderActions();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("won't grant credits without a reason", async () => {
    renderActions();
    await userEvent.type(screen.getByLabelText(/^Credits/), "50");
    await userEvent.click(screen.getByRole("button", { name: /grant/i }));
    expect(grantCreditsAction).not.toHaveBeenCalled();
  });
});
