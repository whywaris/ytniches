import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ComparisonView } from "@/components/features/niche-finder/comparison-view";
import type { NicheChannelResult } from "@/components/features/niche-finder/types";

function makeChannel(overrides: Partial<NicheChannelResult>): NicheChannelResult {
  return {
    id: "1",
    youtubeChannelId: "UC1",
    name: "Channel",
    avatarUrl: null,
    subscriberCount: 100,
    videoCount: 10,
    avgViewsLast30Days: 1000,
    avgViewsLifetime: 800,
    uploadFrequencyPerWeek: 1,
    isMonetized: null,
    language: "en",
    country: "US",
    youtubeCreatedAt: "2020-01-01T00:00:00Z",
    viewTrend: [],
    ...overrides,
  };
}

describe("ComparisonView", () => {
  it("renders nothing for fewer than 2 channels", () => {
    const { container } = render(<ComparisonView channels={[makeChannel({})]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for more than 3 channels", () => {
    const channels = Array.from({ length: 4 }, (_, i) => makeChannel({ id: String(i) }));
    const { container } = render(<ComparisonView channels={channels} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders all channel names for a valid count", () => {
    render(
      <ComparisonView
        channels={[
          makeChannel({ id: "1", name: "Sleep Sounds Daily" }),
          makeChannel({ id: "2", name: "AI History Hub" }),
        ]}
      />,
    );
    expect(screen.getByText("Sleep Sounds Daily")).toBeInTheDocument();
    expect(screen.getByText("AI History Hub")).toBeInTheDocument();
  });

  it("calls onRemove with the clicked channel's id", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <ComparisonView
        channels={[
          makeChannel({ id: "1", name: "Sleep Sounds Daily" }),
          makeChannel({ id: "2", name: "AI History Hub" }),
        ]}
        onRemove={onRemove}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Remove Sleep Sounds Daily from comparison" }),
    );

    expect(onRemove).toHaveBeenCalledWith("1");
  });

  it("does not render a remove button when onRemove is omitted", () => {
    render(
      <ComparisonView
        channels={[makeChannel({ id: "1", name: "A" }), makeChannel({ id: "2", name: "B" })]}
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("highlights the channel with the higher subscriber count for that row", () => {
    render(
      <ComparisonView
        channels={[
          makeChannel({ id: "1", name: "Small", subscriberCount: 100 }),
          makeChannel({ id: "2", name: "Big", subscriberCount: 999_000 }),
        ]}
      />,
    );

    // The winning value's cell carries the accent text class; the loser's doesn't.
    expect(screen.getByText("999.0K")).toHaveClass("text-accent");
    expect(screen.getByText("100")).not.toHaveClass("text-accent");
  });
});
