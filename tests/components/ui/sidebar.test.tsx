import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Compass, LayoutGrid } from "lucide-react";
import { describe, expect, it } from "vitest";

import { Sidebar, SidebarSection } from "@/components/ui/sidebar";
import { SidebarItem } from "@/components/ui/sidebar-item";

function DemoSidebar() {
  return (
    <Sidebar>
      <SidebarSection title="Research">
        <SidebarItem icon={<Compass />} label="Niche Finder" active />
        <SidebarItem icon={<LayoutGrid />} label="Channels" count={12} nested />
      </SidebarSection>
    </Sidebar>
  );
}

describe("Sidebar / SidebarItem", () => {
  it("has no accessibility violations expanded or collapsed", async () => {
    localStorage.clear();
    const user = userEvent.setup();
    const { container } = render(<DemoSidebar />);
    expect(await axe(container)).toHaveNoViolations();

    // Toggle within the same mount rather than faking collapsed state via
    // localStorage + rerender: the persisted value is only read once on
    // mount (by design — it shouldn't resync mid-session from storage).
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(await axe(container)).toHaveNoViolations();
  });

  it("toggles collapsed state and persists it to localStorage", async () => {
    localStorage.clear();
    const user = userEvent.setup();
    render(<DemoSidebar />);

    expect(screen.getByText("Niche Finder")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(screen.queryByText("Niche Finder")).not.toBeInTheDocument();
    expect(localStorage.getItem("ytniches:sidebar-collapsed")).toBe("true");
  });

  it("marks the active item with aria-current", () => {
    render(<DemoSidebar />);
    expect(screen.getByRole("button", { name: "Niche Finder" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("asChild renders the wrapped link as a real anchor with the item's markup", () => {
    render(
      <Sidebar>
        <SidebarItem asChild icon={<Compass />} label="Niche Finder" active>
          {/* A raw anchor on purpose: this tests asChild with any element. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/niches">Niche Finder</a>
        </SidebarItem>
      </Sidebar>,
    );
    const link = screen.getByRole("link", { name: "Niche Finder" });
    expect(link).toHaveAttribute("href", "/niches");
    expect(link).toHaveAttribute("aria-current", "page");
  });
});
