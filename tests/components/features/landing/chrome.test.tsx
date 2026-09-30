import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/analytics/client", () => ({ capture: vi.fn() }));
const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const { Navbar } = await import("@/components/features/landing/navbar");
const { LazyCommandPalette } = await import("@/components/features/landing/lazy-command-palette");

describe("Navbar (D-082)", () => {
  it("links Pricing, Blog and Tools, with Log in and Start free", () => {
    render(<Navbar blogLive />);
    for (const [name, href] of [
      ["Pricing", "/pricing"],
      ["Blog", "/blog"],
      ["Tools", "/tools"],
      ["Log in", "/login"],
      ["Start free", "/signup"],
    ]) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  it("loads the mobile menu dialog on first tap", async () => {
    render(<Navbar blogLive />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Open menu" }));
    expect(await screen.findByRole("dialog", { name: "Menu" })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Navbar blogLive />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("LazyCommandPalette (D-082)", () => {
  it("renders nothing until Cmd/Ctrl+K, then loads and opens the palette", async () => {
    const user = userEvent.setup();
    render(<LazyCommandPalette />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.keyboard("{Control>}k{/Control}");

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(await screen.findByText("How it works")).toBeInTheDocument();
    // No stale anchors from the old landing page.
    expect(screen.queryByText("Templates")).not.toBeInTheDocument();
  });
});
