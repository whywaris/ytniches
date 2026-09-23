import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/toast-provider";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const acceptInvitationAndActivateAction = vi.fn();
vi.mock("@/app/invite/actions", () => ({
  acceptInvitationAndActivateAction: (...args: unknown[]) =>
    acceptInvitationAndActivateAction(...args),
}));

const { InviteClient } = await import("@/app/invite/invite-client");

function renderClient(props: Partial<ComponentProps<typeof InviteClient>> = {}) {
  return render(
    <ToastProvider>
      <InviteClient
        token="tok-1"
        preview={{ workspaceName: "Acme", role: "editor" }}
        isAuthenticated
        {...props}
      />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("InviteClient", () => {
  it("has no accessibility violations", async () => {
    const { container } = renderClient();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows an invalid-link message when there is no preview", () => {
    renderClient({ preview: null });
    expect(screen.getByText("That invitation link is no longer valid.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows a login link, not an accept button, when signed out", () => {
    renderClient({ isAuthenticated: false });
    expect(screen.getByRole("link", { name: "Log in to accept" })).toHaveAttribute(
      "href",
      "/login?redirect=%2Finvite%3Ftoken%3Dtok-1",
    );
    expect(screen.queryByRole("button", { name: "Accept invitation" })).not.toBeInTheDocument();
  });

  it("accepts the invitation and redirects to /workspace on success", async () => {
    acceptInvitationAndActivateAction.mockResolvedValue({
      ok: true,
      value: { id: "ws-1", name: "Acme", slug: "acme", ownerId: "owner-1" },
    });
    renderClient();

    await userEvent.click(screen.getByRole("button", { name: "Accept invitation" }));

    expect(acceptInvitationAndActivateAction).toHaveBeenCalledWith("tok-1");
    expect(push).toHaveBeenCalledWith("/workspace");
  });

  it("shows an error toast when the invitation is rejected on accept", async () => {
    acceptInvitationAndActivateAction.mockResolvedValue({
      ok: false,
      error: { type: "invalid_invitation" },
    });
    renderClient();

    await userEvent.click(screen.getByRole("button", { name: "Accept invitation" }));

    expect(await screen.findByText("That invitation is no longer valid")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
