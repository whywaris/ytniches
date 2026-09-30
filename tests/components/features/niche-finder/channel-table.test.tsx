import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ChannelTable } from "@/components/features/niche-finder/channel-table";
import type { NicheChannelResult } from "@/components/features/niche-finder/types";

const CHANNELS: NicheChannelResult[] = [
  {
    id: "1",
    youtubeChannelId: "UC1",
    name: "Sleep Sounds Daily",
    avatarUrl: null,
    subscriberCount: 482_000,
    videoCount: 310,
    avgViewsLast30Days: 91_200,
    avgViewsLifetime: 64_500,
    uploadFrequencyPerWeek: 3,
    viewsStatus: "measured",
    isMonetized: true,
    language: "en",
    country: "US",
    youtubeCreatedAt: "2019-03-01T00:00:00Z",
    viewTrend: [],
  },
  {
    id: "2",
    youtubeChannelId: "UC2",
    name: "AI History Hub",
    avatarUrl: null,
    subscriberCount: 128_500,
    videoCount: 96,
    avgViewsLast30Days: 34_100,
    avgViewsLifetime: 28_900,
    uploadFrequencyPerWeek: 5,
    viewsStatus: "measured",
    isMonetized: null,
    language: "en",
    country: "CA",
    youtubeCreatedAt: "2021-07-01T00:00:00Z",
    viewTrend: [],
  },
];

afterEach(() => {
  window.localStorage.clear();
});

describe("ChannelTable", () => {
  it("calls onOpen with the clicked row's id", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <ChannelTable
        channels={CHANNELS}
        savedChannelIds={new Set()}
        onSave={() => {}}
        onOpen={onOpen}
      />,
    );

    await user.click(screen.getByText("Sleep Sounds Daily"));

    expect(onOpen).toHaveBeenCalledWith("1");
  });

  it("calls onSave without also triggering onOpen (stopPropagation)", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const onSave = vi.fn();
    render(
      <ChannelTable
        channels={CHANNELS}
        savedChannelIds={new Set()}
        onSave={onSave}
        onOpen={onOpen}
      />,
    );

    await user.click(screen.getAllByRole("button", { name: "Save to tracking" })[0]);

    expect(onSave).toHaveBeenCalledWith("1");
    expect(onOpen).not.toHaveBeenCalled();
  });

  it("renders the saved bookmark state only for rows in savedChannelIds", () => {
    render(
      <ChannelTable
        channels={CHANNELS}
        savedChannelIds={new Set(["2"])}
        onSave={() => {}}
        onOpen={() => {}}
      />,
    );

    expect(screen.getAllByRole("button", { name: "Save to tracking" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Remove from tracking" })).toBeInTheDocument();
  });

  it("renders 'Yes'/'No'/'—' for isMonetized true/false/null", () => {
    render(
      <ChannelTable
        channels={CHANNELS}
        savedChannelIds={new Set()}
        onSave={() => {}}
        onOpen={() => {}}
      />,
    );
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("persists density changes to localStorage", async () => {
    const user = userEvent.setup();
    render(
      <ChannelTable
        channels={CHANNELS}
        savedChannelIds={new Set()}
        onSave={() => {}}
        onOpen={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Compact" }));

    expect(window.localStorage.getItem("ytniches:niche-finder-density")).toBe("compact");
  });

  it("reads a previously persisted density on mount", async () => {
    window.localStorage.setItem("ytniches:niche-finder-density", "compact");
    render(
      <ChannelTable
        channels={CHANNELS}
        savedChannelIds={new Set()}
        onSave={() => {}}
        onOpen={() => {}}
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Compact", pressed: true }),
    ).toBeInTheDocument();
  });
});
