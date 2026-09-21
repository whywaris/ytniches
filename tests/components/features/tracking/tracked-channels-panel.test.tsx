import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { TrackedChannelsPanel } from "@/components/features/tracking/tracked-channels-panel";
import type { TrackedChannelSummary } from "@/components/features/tracking/types";

const CHANNELS: TrackedChannelSummary[] = [
  {
    id: "chan-1",
    name: "Sleep Sounds Daily",
    avatarUrl: null,
    lastActivityAt: "2026-01-01T10:00:00Z",
  },
  { id: "chan-2", name: "Tiny Tech Reviews", avatarUrl: null, lastActivityAt: null },
];

describe("TrackedChannelsPanel", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<TrackedChannelsPanel channels={CHANNELS} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the empty state when there are no tracked channels", () => {
    render(<TrackedChannelsPanel channels={[]} />);
    expect(screen.getByText("No tracked channels yet")).toBeInTheDocument();
  });

  it("renders each channel's name and last-activity time", () => {
    render(<TrackedChannelsPanel channels={CHANNELS} />);
    expect(screen.getByText("Sleep Sounds Daily")).toBeInTheDocument();
    expect(screen.getByText("Tiny Tech Reviews")).toBeInTheDocument();
    expect(screen.getByText("No activity yet")).toBeInTheDocument();
  });

  it("filters the list as the user types", async () => {
    const user = userEvent.setup();
    render(<TrackedChannelsPanel channels={CHANNELS} />);

    await user.type(screen.getByRole("searchbox", { name: "Filter tracked channels" }), "tiny");

    expect(screen.getByText("Tiny Tech Reviews")).toBeInTheDocument();
    expect(screen.queryByText("Sleep Sounds Daily")).not.toBeInTheDocument();
  });

  it("shows a no-match message when the filter matches nothing", async () => {
    const user = userEvent.setup();
    render(<TrackedChannelsPanel channels={CHANNELS} />);

    await user.type(screen.getByRole("searchbox", { name: "Filter tracked channels" }), "zzz");

    expect(screen.getByText(/No channels match/)).toBeInTheDocument();
  });

  it("selects a channel on click", async () => {
    const user = userEvent.setup();
    const onSelectChannel = vi.fn();
    render(<TrackedChannelsPanel channels={CHANNELS} onSelectChannel={onSelectChannel} />);

    await user.click(screen.getByText("Sleep Sounds Daily"));

    expect(onSelectChannel).toHaveBeenCalledWith("chan-1");
  });

  it("clicking the already-active channel clears the selection", async () => {
    const user = userEvent.setup();
    const onSelectChannel = vi.fn();
    render(
      <TrackedChannelsPanel
        channels={CHANNELS}
        activeChannelId="chan-1"
        onSelectChannel={onSelectChannel}
      />,
    );

    await user.click(screen.getByText("Sleep Sounds Daily"));

    expect(onSelectChannel).toHaveBeenCalledWith(null);
  });
});
