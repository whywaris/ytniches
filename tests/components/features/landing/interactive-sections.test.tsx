import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/analytics/client", () => ({ capture: vi.fn() }));

const { CreatorExplorer } = await import("@/components/features/landing/creator-explorer");
const { ViewSwitcher } = await import("@/components/features/landing/view-switcher");
const { ModeToggle } = await import("@/components/features/landing/mode-toggle");
const { TemplatesShowcase } = await import("@/components/features/landing/templates-showcase");
const { Integrations } = await import("@/components/features/landing/integrations");
const { capture } = await import("@/lib/analytics/client");

describe("CreatorExplorer", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<CreatorExplorer />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("defaults to AI-voice explainer and swaps the preview on click", async () => {
    render(<CreatorExplorer />);
    expect(screen.getByRole("tab", { name: /AI-voice explainer/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Prompts tuned for scripted narration style")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("tab", { name: /Kids stories/ }));

    expect(screen.getByRole("tab", { name: /Kids stories/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(
      await screen.findByText("Filter for family-safe, monetized channels"),
    ).toBeInTheDocument();
    expect(capture).toHaveBeenCalledWith("landing_creator_type_selected", { type: "kids" });
  });

  it("moves selection with arrow keys", async () => {
    render(<CreatorExplorer />);
    screen.getByRole("tab", { name: /AI-voice explainer/ }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: /Compilation/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});

describe("ViewSwitcher", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<ViewSwitcher />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("defaults to Grid and switches caption to the chosen view", async () => {
    render(<ViewSwitcher />);
    expect(screen.getByText(/Fastest to scan/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Insights" }));
    expect(await screen.findByText(/Coming soon\./)).toBeInTheDocument();
  });
});

describe("ModeToggle", () => {
  it("swaps copy between Beginner and Power", async () => {
    render(<ModeToggle />);
    expect(screen.getByText(/Three fields\. One button\./)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "Power" }));
    expect(await screen.findByText(/Every filter, every metric/)).toBeInTheDocument();
  });
});

describe("TemplatesShowcase", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<TemplatesShowcase />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("opens an honest 'coming soon' modal for a clicked template", async () => {
    render(<TemplatesShowcase />);
    await userEvent.click(screen.getByRole("button", { name: /Title A\/B prompt/ }));

    const dialog = await screen.findByRole("dialog", {}, { timeout: 5000 });
    expect(within(dialog).getByText("Title A/B prompt")).toBeInTheDocument();
    expect(within(dialog).getByText("Coming soon, sign up to get it first.")).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: "Sign up free" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });
});

describe("Integrations", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<Integrations />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows a tooltip and tags unbuilt integrations as Soon", async () => {
    render(<Integrations />);
    expect(
      within(screen.getByRole("button", { name: /Notion/ })).getByText("Soon"),
    ).toBeInTheDocument();
    expect(within(screen.getByRole("button", { name: /YouTube/ })).queryByText("Soon")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: /YouTube/ }));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Read-only. We fetch what’s public.");
  });
});
