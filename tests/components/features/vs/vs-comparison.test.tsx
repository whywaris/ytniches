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

const { COMPETITOR_PAGES } = await import("@/content/vs");
const { YTNICHES, FEATURE_LABELS } = await import("@/content/vs/ytniches");
const { TRIAL, trialSummary } = await import("@/lib/billing/plans");
const { BETA_MODE } = await import("@/lib/billing/beta");

const STATUS_TEXT = {
  yes: "Yes",
  partial: "Partly",
  no: "No",
  "not-listed": "Not listed on their site",
};

// Rows by their header text, cells as [YTNiches, competitor]. Status is
// the first span, compared exactly ("No" is a substring of "Not listed").
function renderedRows(container: HTMLElement) {
  return new Map(
    [...container.querySelectorAll("tbody tr")].map((tr) => {
      const [ours, theirs] = [...tr.querySelectorAll("td")].map((td) => ({
        status: td.querySelector("span")?.textContent,
        text: td.textContent,
      }));
      return [tr.querySelector("th")?.textContent, { ours, theirs }];
    }),
  );
}

describe.each(COMPETITOR_PAGES)("/vs/$id", (page) => {
  it("shows YTNiches' free trial as Yes, from the plans file", () => {
    const { container } = render(<VsComparison page={page} />);
    const trial = renderedRows(container).get("Free trial");

    expect(trial, `${page.id} has no Free trial row`).toBeDefined();
    expect(trial!.ours.status).toBe("Yes");
    expect(trial!.ours.text).toContain(trialSummary());
    expect(trialSummary()).toBe(
      BETA_MODE
        ? `free during beta, ${TRIAL.credits} credits a month, no card`
        : `${TRIAL.days} days of Pro, no card`,
    );
  });

  // Guards against a column swap: each rendered cell must match the side
  // it belongs to, for every row on every page.
  it("renders every row in the right column", () => {
    const { container } = render(<VsComparison page={page} />);
    const rows = renderedRows(container);

    for (const row of page.rows) {
      const rendered = rows.get(FEATURE_LABELS[row.key]);
      expect(rendered, `${page.id}: row "${row.key}" not rendered`).toBeDefined();
      expect(rendered!.ours.status, `${page.id} ${row.key}: YTNiches column`).toBe(
        STATUS_TEXT[YTNICHES[row.key].status],
      );
      expect(rendered!.theirs.status, `${page.id} ${row.key}: ${page.name} column`).toBe(
        STATUS_TEXT[row.them.status],
      );
    }
  });
});
