import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider } from "@/components/ui/toast-provider";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const inviteMemberAction = vi.fn();
const removeMemberAction = vi.fn();
const updateMemberRoleAction = vi.fn();
const leaveWorkspaceAction = vi.fn();
const deleteWorkspaceAction = vi.fn();
vi.mock("@/app/(app)/workspace/actions", () => ({
  inviteMemberAction: (...args: unknown[]) => inviteMemberAction(...args),
  removeMemberAction: (...args: unknown[]) => removeMemberAction(...args),
  updateMemberRoleAction: (...args: unknown[]) => updateMemberRoleAction(...args),
  leaveWorkspaceAction: (...args: unknown[]) => leaveWorkspaceAction(...args),
  deleteWorkspaceAction: (...args: unknown[]) => deleteWorkspaceAction(...args),
}));

const { MembersClient } = await import("@/app/(app)/workspace/members/members-client");

const WORKSPACE = {
  id: "ws-1",
  name: "Acme",
  slug: "acme",
  ownerId: "user-1",
  members: [
    {
      id: "m1",
      userId: "user-1",
      name: "Alice",
      avatarUrl: null,
      role: "admin" as const,
      joinedAt: "2026-01-01",
    },
    {
      id: "m2",
      userId: "user-2",
      name: "Bob",
      avatarUrl: null,
      role: "editor" as const,
      joinedAt: "2026-01-02",
    },
  ],
};

function renderClient(props: Partial<ComponentProps<typeof MembersClient>> = {}) {
  return render(
    <ToastProvider>
      <MembersClient workspace={WORKSPACE} myUserId="user-1" myRole="admin" {...props} />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("MembersClient", () => {
  it("has no accessibility violations", async () => {
    const { container } = renderClient();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows both members, marking the owner and the current user", () => {
    renderClient();
    expect(screen.getByText("Alice (you) · Owner")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("hides the invite form and admin controls for a non-admin viewer", () => {
    renderClient({ myRole: "viewer", myUserId: "user-2" });
    expect(screen.queryByText("Invite a member")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("sends an invite as an admin", async () => {
    inviteMemberAction.mockResolvedValue({ ok: true, value: undefined });
    renderClient();

    await userEvent.type(screen.getByLabelText("Email"), "new@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Send invite" }));

    expect(inviteMemberAction).toHaveBeenCalledWith("ws-1", {
      email: "new@example.com",
      role: "editor",
    });
    expect(await screen.findByText("Invite sent to new@example.com")).toBeInTheDocument();
  });

  it("does not offer to remove the owner", () => {
    renderClient();
    const ownerRow = screen.getByText("Alice (you) · Owner").closest("div")?.parentElement;
    expect(ownerRow).not.toBeNull();
    expect(ownerRow?.querySelector("button")).toBeNull();
  });

  it("removes a non-owner member as an admin", async () => {
    removeMemberAction.mockResolvedValue({ ok: true, value: undefined });
    renderClient();

    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(removeMemberAction).toHaveBeenCalledWith("ws-1", "user-2");
  });

  it("shows the leave button for a non-owner and not for the owner", () => {
    renderClient();
    expect(screen.queryByRole("button", { name: "Leave workspace" })).not.toBeInTheDocument();

    renderClient({ myUserId: "user-2", myRole: "editor" });
    expect(screen.getByRole("button", { name: "Leave workspace" })).toBeInTheDocument();
  });

  it("deletes the workspace as an admin", async () => {
    deleteWorkspaceAction.mockResolvedValue({ ok: true, value: undefined });
    renderClient();

    await userEvent.click(screen.getByRole("button", { name: "Delete workspace" }));

    expect(deleteWorkspaceAction).toHaveBeenCalledWith("ws-1");
    expect(push).toHaveBeenCalledWith("/workspace");
  });
});
