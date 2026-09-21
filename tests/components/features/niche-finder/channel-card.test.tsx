import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChannelCard } from "@/components/features/niche-finder/channel-card";
import type { NicheChannelResult } from "@/components/features/niche-finder/types";

const CHANNEL: NicheChannelResult = {
  id: "internal-1",
  youtubeChannelId: "UC1",
  name: "Sleep Sounds Daily",
  avatarUrl: null,
  subscriberCount: 482_000,
  videoCount: 310,
  avgViewsLast30Days: 91_200,
  avgViewsLifetime: 64_500,
  uploadFrequencyPerWeek: 3,
  isMonetized: true,
  language: "en",
  country: "US",
  youtubeCreatedAt: "2019-03-01T00:00:00Z",
  viewTrend: [42_000, 58_000, 91_200],
};

describe("ChannelCard", () => {
  it("calls onOpen with the channel id when the card is clicked", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<ChannelCard channel={CHANNEL} onOpen={onOpen} />);

    await user.click(screen.getByText("Sleep Sounds Daily"));

    expect(onOpen).toHaveBeenCalledWith("internal-1");
  });

  it("calls onSave without also triggering onOpen (stopPropagation)", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onSave = vi.fn();
    render(<ChannelCard channel={CHANNEL} onOpen={onOpen} onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Save to tracking" }));

    expect(onSave).toHaveBeenCalledWith("internal-1");
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("renders the unsaved bookmark state when saved is omitted", () => {
    render(<ChannelCard channel={CHANNEL} />);
    expect(screen.getByRole("button", { name: "Save to tracking" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("renders the saved bookmark state when saved is true", () => {
    render(<ChannelCard channel={CHANNEL} saved />);
    expect(screen.getByRole("button", { name: "Remove from tracking" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("renders the sparkline when viewTrend has more than one point", () => {
    render(<ChannelCard channel={CHANNEL} />);
    expect(screen.getByTestId("channel-card-sparkline")).toBeInTheDocument();
  });

  it("omits the sparkline for a cold-cache channel with an empty viewTrend", () => {
    render(<ChannelCard channel={{ ...CHANNEL, viewTrend: [] }} />);
    expect(screen.queryByTestId("channel-card-sparkline")).not.toBeInTheDocument();
  });

  it("omits the sparkline when viewTrend has only one point", () => {
    render(<ChannelCard channel={{ ...CHANNEL, viewTrend: [91_200] }} />);
    expect(screen.queryByTestId("channel-card-sparkline")).not.toBeInTheDocument();
  });
});
