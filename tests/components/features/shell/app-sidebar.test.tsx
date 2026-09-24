import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/niches" }));

const { AppSidebar } = await import("@/components/features/shell/app-sidebar");

describe("AppSidebar", () => {
  // Sidebar's collapse state reads localStorage post-mount (tests/components/
  // ui/sidebar.test.tsx's own toggle test leaves "true" behind under this
  // project's shared isolate:false worker) -- a stale collapsed sidebar
  // hides every label/count badge these tests check for.
  beforeEach(() => {
    localStorage.clear();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AppSidebar hasWorkspace={false} trackedChannelCount={3} promptCount={5} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("hides the Team section for a user with no workspace", () => {
    render(<AppSidebar hasWorkspace={false} trackedChannelCount={0} promptCount={0} />);
    expect(screen.queryByText("Team")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Tasks" })).not.toBeInTheDocument();
  });

  it("shows the Team section for a user with a workspace", () => {
    render(<AppSidebar hasWorkspace promptCount={0} trackedChannelCount={0} />);
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Workspace" })).toHaveAttribute("href", "/workspace");
    expect(screen.getByRole("link", { name: "Tasks" })).toHaveAttribute("href", "/workspace/tasks");
    expect(screen.getByRole("link", { name: "Calendar" })).toHaveAttribute("href", "/calendar");
  });

  it("marks the current route active and shows Library counts", () => {
    render(<AppSidebar hasWorkspace={false} trackedChannelCount={12} promptCount={7} />);
    expect(screen.getByRole("link", { name: "Niche Finder" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });
});
