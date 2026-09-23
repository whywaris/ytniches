import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/toast-provider";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const createWorkspaceAction = vi.fn();
const setActiveWorkspaceCookieAction = vi.fn();
vi.mock("@/app/(app)/workspace/actions", () => ({
  createWorkspaceAction: (...args: unknown[]) => createWorkspaceAction(...args),
  setActiveWorkspaceCookieAction: (...args: unknown[]) => setActiveWorkspaceCookieAction(...args),
}));

const createCheckoutAction = vi.fn();
vi.mock("@/app/(app)/settings/billing/actions", () => ({
  createCheckoutAction: (...args: unknown[]) => createCheckoutAction(...args),
}));

vi.mock("@/lib/analytics", () => ({ capture: vi.fn() }));

const { WorkspaceClient } = await import("@/app/(app)/workspace/workspace-client");

function renderClient(props: Partial<ComponentProps<typeof WorkspaceClient>> = {}) {
  return render(
    <ToastProvider>
      <WorkspaceClient isTeamTier workspace={null} myRole={null} {...props} />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("WorkspaceClient", () => {
  it("has no accessibility violations", async () => {
    const { container } = renderClient();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows an upgrade prompt for a non-Team-tier user instead of the create form", () => {
    renderClient({ isTeamTier: false });
    expect(screen.getByRole("button", { name: "Upgrade to Team" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Workspace name")).not.toBeInTheDocument();
  });

  it("shows the create-workspace form for a Team-tier user with no workspace yet", () => {
    renderClient({ isTeamTier: true, workspace: null });
    expect(screen.getByLabelText("Workspace name")).toBeInTheDocument();
  });

  it("shows the workspace overview once one exists", () => {
    renderClient({
      isTeamTier: true,
      workspace: { id: "ws-1", name: "Acme", slug: "acme", ownerId: "user-1" },
      myRole: "admin",
    });
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Manage members" })).toHaveAttribute(
      "href",
      "/workspace/members",
    );
  });

  it("creates a workspace and sets the active-workspace cookie on success", async () => {
    createWorkspaceAction.mockResolvedValue({
      ok: true,
      value: { id: "ws-1", name: "Acme", slug: "acme", ownerId: "user-1" },
    });
    renderClient({ isTeamTier: true, workspace: null });

    await userEvent.type(screen.getByLabelText("Workspace name"), "Acme");
    await userEvent.click(screen.getByRole("button", { name: "Create workspace" }));

    expect(createWorkspaceAction).toHaveBeenCalledWith({ name: "Acme" });
    expect(await screen.findByText("Acme")).toBeInTheDocument();
    expect(setActiveWorkspaceCookieAction).toHaveBeenCalledWith("ws-1");
  });

  it("opens the upgrade modal when creation is blocked by tier", async () => {
    createWorkspaceAction.mockResolvedValue({ ok: false, error: { type: "not_team_tier" } });
    renderClient({ isTeamTier: true, workspace: null });

    await userEvent.type(screen.getByLabelText("Workspace name"), "Acme");
    await userEvent.click(screen.getByRole("button", { name: "Create workspace" }));

    expect(await screen.findByText("Upgrade your plan")).toBeInTheDocument();
  });
});
