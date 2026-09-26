import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { DiscoveryChannelCard } from "@/components/features/niche-finder/discovery-channel-card";

import { CHANNEL } from "./fixtures";

describe("DiscoveryChannelCard (spec §9.3)", () => {
  it("shows the four stat tiles", () => {
    render(<DiscoveryChannelCard channel={CHANNEL} />);
    const tile = (label: string) => screen.getByText(label).nextElementSibling;
    expect(tile("Avg views/video")).toHaveTextContent("38.5K");
    expect(tile("Days since start")).toHaveTextContent("209");
    expect(tile("Uploads")).toHaveTextContent("41");
    expect(tile("Outlier score")).toHaveTextContent("4.7x");
  });

  it("shows 4 popular videos linking to YouTube", () => {
    render(<DiscoveryChannelCard channel={CHANNEL} />);
    const links = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("https://www.youtube.com/watch"));
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveAttribute("href", "https://www.youtube.com/watch?v=pv1");
  });

  it("labels the monetization estimate as an estimate", () => {
    render(<DiscoveryChannelCard channel={CHANNEL} />);
    expect(screen.getByText("Likely monetized (est.)")).toBeInTheDocument();
    expect(screen.getByText("Faceless")).toBeInTheDocument();
  });

  it("tracks by channel id, and disables once tracked", async () => {
    const onTrack = vi.fn();
    const { rerender } = render(<DiscoveryChannelCard channel={CHANNEL} onTrack={onTrack} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Track" }));
    expect(onTrack).toHaveBeenCalledWith("c1");

    rerender(<DiscoveryChannelCard channel={CHANNEL} onTrack={onTrack} tracked />);
    expect(screen.getByRole("button", { name: "Tracking" })).toBeDisabled();
  });

  it("shows dashes rather than zeros for unknown metrics", () => {
    render(
      <DiscoveryChannelCard channel={{ ...CHANNEL, avgViewsRecent: null, outlierScore: null }} />,
    );
    expect(screen.getByText("Outlier score").nextElementSibling).toHaveTextContent("—");
  });

  it("has no axe violations", async () => {
    const { container } = render(<DiscoveryChannelCard channel={CHANNEL} onTrack={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
