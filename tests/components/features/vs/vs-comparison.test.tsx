import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { NEXLEV } from "@/content/vs/nexlev";
import { OUTLIERKIT } from "@/content/vs/outlierkit";

vi.mock("@/lib/analytics/client", () => ({ capture: vi.fn() }));

const { VsComparison } = await import("@/components/features/vs/vs-comparison");

describe("VsComparison", () => {
  it("shows the check date, a sourced table and no axe violations", async () => {
    const { container } = render(<VsComparison page={OUTLIERKIT} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("YTNiches vs OutlierKit");
    expect(screen.getByText(/Last checked:/)).toHaveTextContent("25 Sept 2026");
    const keywordRow = screen.getByRole("row", { name: /Keyword research/ });
    expect(
      within(keywordRow).getByText("Search volume and ranking difficulty"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start free trial/ })).toHaveAttribute(
      "href",
      "/signup",
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows current OutlierKit prices, not struck-through ones", () => {
    render(<VsComparison page={OUTLIERKIT} />);
    expect(screen.getByText("$29")).toBeInTheDocument();
    expect(screen.queryByText("$79")).not.toBeInTheDocument();
  });

  it("quotes no Nexlev price and links to their pricing page instead", () => {
    const { container } = render(<VsComparison page={NEXLEV} />);
    const nexlevCard = screen.getByRole("heading", { level: 3, name: "Nexlev" }).parentElement!;
    expect(within(nexlevCard).queryByText(/\$\d/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /See Nexlev's current pricing/ })).toHaveAttribute(
      "href",
      "https://www.nexlev.io/pricing",
    );
    expect(container.querySelector("img")).toBeNull();
  });

  it("labels unverified cells as not listed, never as a no", () => {
    render(<VsComparison page={NEXLEV} />);
    const calendarRow = screen.getByRole("row", { name: /Content calendar/ });
    expect(within(calendarRow).getByText("Not listed on their site")).toBeInTheDocument();
  });
});
