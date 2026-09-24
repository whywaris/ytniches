import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";

let pathname = "/niches";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const { AppSidebar } = await import("@/components/features/shell/app-sidebar");

function renderSidebar(overrides: Partial<Parameters<typeof AppSidebar>[0]> = {}) {
  const onOpenSearch = vi.fn();
  render(
    <AppSidebar
      hasWorkspace={false}
      trackedChannelCount={12}
      promptCount={7}
      onOpenSearch={onOpenSearch}
      {...overrides}
    />,
  );
  return { onOpenSearch };
}

describe("AppSidebar", () => {
  // Sidebar collapse state is read from localStorage post-mount; start expanded.
  beforeEach(() => {
    localStorage.clear();
    pathname = "/niches";
  });

  it("has no accessibility violations", async () => {
    const onOpenSearch = vi.fn();
    const { container } = render(
      <AppSidebar
        hasWorkspace
        trackedChannelCount={3}
        promptCount={5}
        onOpenSearch={onOpenSearch}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the brand, Dashboard, and Research/Create groups", () => {
    renderSidebar();
    expect(screen.getByRole("link", { name: "YTNiches home" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Research")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
    expect(screen.queryByText("Library")).toBeNull();
  });

  it("hides the Plan group without a workspace", () => {
    renderSidebar({ hasWorkspace: false });
    expect(screen.queryByText("Plan")).toBeNull();
    expect(screen.queryByRole("link", { name: "Tasks" })).toBeNull();
  });

  it("shows Plan (Calendar, Tasks, Workspace) with a workspace", () => {
    renderSidebar({ hasWorkspace: true });
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Calendar" })).toHaveAttribute("href", "/calendar");
    expect(screen.getByRole("link", { name: "Tasks" })).toHaveAttribute("href", "/workspace/tasks");
    expect(screen.getByRole("link", { name: "Workspace" })).toHaveAttribute("href", "/workspace");
  });

  it("puts counts on Competitor Tracking and AI Prompts, one link per page", () => {
    renderSidebar({ trackedChannelCount: 12, promptCount: 7 });
    expect(screen.getByRole("link", { name: /Competitor Tracking/ })).toHaveTextContent("12");
    expect(screen.getByRole("link", { name: /AI Prompts/ })).toHaveTextContent("7");
    expect(
      screen.getAllByRole("link").filter((l) => l.getAttribute("href") === "/tracking"),
    ).toHaveLength(1);
  });

  it("highlights only the longest-matching item", () => {
    pathname = "/workspace/tasks";
    renderSidebar({ hasWorkspace: true });
    expect(screen.getByRole("link", { name: "Tasks" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Workspace" })).not.toHaveAttribute("aria-current");
  });

  it("opens search from the sidebar trigger", async () => {
    const { onOpenSearch } = renderSidebar();
    await userEvent.click(screen.getByRole("button", { name: "Search (Cmd+K)" }));
    expect(onOpenSearch).toHaveBeenCalledTimes(1);
  });
});
