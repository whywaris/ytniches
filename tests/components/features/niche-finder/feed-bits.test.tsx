import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const { FeedTabs } = await import("@/components/features/niche-finder/feed-tabs");
const { FeedPagination } = await import("@/components/features/niche-finder/feed-pagination");
const { FreshnessLine } = await import("@/components/features/niche-finder/freshness-line");
const { SignalBars } = await import("@/components/features/niche-finder/signal-bars");

const HREFS = {
  niches: "/niches",
  channels: "/niches?tab=channels",
  outliers: "/niches?tab=outliers",
  search: "/niches?tab=search",
};

describe("FeedTabs", () => {
  it("renders the four tabs with the active one selected", async () => {
    const { container } = render(
      <FeedTabs active="channels" hrefs={HREFS}>
        <p>Channel feed</p>
      </FeedTabs>,
    );
    // D-077: Channels first; "Breakout videos" never collides with "Your outliers".
    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Channels",
      "Niches",
      "Breakout videos",
      "Search",
    ]);
    expect(screen.getByRole("tab", { name: "Channels" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Channel feed")).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("FreshnessLine", () => {
  it("always shows freshness (honest data, spec §2)", () => {
    const now = new Date("2026-09-26T12:00:00Z").getTime();
    render(<FreshnessLine updatedAt="2026-09-26T09:00:00Z" newChannelsThisWeek={1284} now={now} />);
    expect(screen.getByText("Updated 3h ago · 1,284 new channels this week")).toBeInTheDocument();
  });

  it("says the first update is pending before any run", () => {
    render(<FreshnessLine updatedAt={null} newChannelsThisWeek={0} />);
    expect(screen.getByText(/First update pending/)).toBeInTheDocument();
  });
});

describe("FeedPagination", () => {
  it("links to neighbouring pages and hides for a single page", async () => {
    const { container, rerender } = render(
      <FeedPagination page={2} pageSize={24} total={100} hrefFor={(n) => `/p/${n}`} />,
    );
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute("href", "/p/1");
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute("href", "/p/3");
    expect(await axe(container)).toHaveNoViolations();

    rerender(<FeedPagination page={1} pageSize={24} total={10} hrefFor={(n) => `/p/${n}`} />);
    expect(screen.queryByRole("navigation")).toBeNull();
  });
});

describe("SignalBars", () => {
  it("shows points out of each weight, adding up to the score", async () => {
    const { container } = render(
      <SignalBars
        signals={{ accessibility: 1, demand: 0.5, momentum: 0.5, outlierDensity: 0, supply: null }}
      />,
    );
    expect(screen.getByText("30 / 30 pts")).toBeInTheDocument();
    expect(screen.getByText("13 / 25 pts")).toBeInTheDocument();
    expect(screen.getByRole("meter", { name: "Low supply" })).toHaveAttribute("aria-valuenow", "0");
    expect(await axe(container)).toHaveNoViolations();
  });
});
