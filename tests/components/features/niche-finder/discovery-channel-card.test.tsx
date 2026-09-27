import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { DiscoveryChannelCard } from "@/components/features/niche-finder/discovery-channel-card";

import { CHANNEL } from "./fixtures";

const stat = (label: string) => screen.getByText(label).nextElementSibling;

describe("DiscoveryChannelCard (D-077)", () => {
  it("shows the eight top stats, typical views as the median", () => {
    render(<DiscoveryChannelCard channel={CHANNEL} />);
    expect(stat("Subscribers")).toHaveTextContent("8.2K");
    expect(stat("Views on uploads from the last 30 days")).toHaveTextContent("912.0K");
    expect(stat("Active since")).toHaveTextContent("Mar 2026");
    expect(stat("Total videos")).toHaveTextContent("41");
    expect(stat("Typical views")).toHaveTextContent("164.0K");
    expect(stat("Language")).toHaveTextContent("English");
    expect(stat("Content type")).toHaveTextContent("Long-form");
    expect(screen.getByText("Spotted")).toBeInTheDocument();
  });

  it("switches to a true 'Views (30 days)' once readings exist", () => {
    render(
      <DiscoveryChannelCard channel={{ ...CHANNEL, views30d: { kind: "true", value: 50_000 } }} />,
    );
    expect(stat("Views (30 days)")).toHaveTextContent("50.0K");
    expect(screen.queryByText("Views on uploads from the last 30 days")).not.toBeInTheDocument();
  });

  it("shows the top 3 videos with the Outlier badge only on outliers", () => {
    render(<DiscoveryChannelCard channel={CHANNEL} />);
    const links = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("https://www.youtube.com/watch"));
    expect(links).toHaveLength(3);
    expect(within(links[0]!).getByText("Outlier 6.2x")).toBeInTheDocument();
    expect(within(links[1]!).queryByText(/Outlier/)).not.toBeInTheDocument();
  });

  it("lists every niche tag, primary first, and links the footer actions", () => {
    render(<DiscoveryChannelCard channel={CHANNEL} />);
    const tags = within(screen.getByRole("list", { name: "Niches" })).getAllByRole("link");
    expect(tags.map((tag) => tag.textContent)).toEqual(["Mafia History", "True Crime"]);
    expect(screen.getByRole("link", { name: /Similar channels/ })).toHaveAttribute(
      "href",
      "/niches?niche=mafia-history",
    );
    expect(screen.getByRole("link", { name: /Analyze niche/ })).toHaveAttribute(
      "href",
      "/niches/mafia-history",
    );
    expect(screen.getByRole("link", { name: /Generate prompts/ })).toHaveAttribute(
      "href",
      "/prompts?channelId=c1&videoId=vid-1",
    );
    expect(screen.getByText("20x views vs subs")).toBeInTheDocument();
  });

  it("explains each insight chip in a tooltip on focus", async () => {
    render(<DiscoveryChannelCard channel={CHANNEL} />);
    screen.getByRole("button", { name: "Breakout" }).focus();
    expect(await screen.findByRole("tooltip")).toHaveTextContent(/3× the channel's usual views/);
  });

  it("tracks by channel id, and disables once tracked", async () => {
    const onTrack = vi.fn();
    const { rerender } = render(<DiscoveryChannelCard channel={CHANNEL} onTrack={onTrack} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Track" }));
    expect(onTrack).toHaveBeenCalledWith("c1");
    rerender(<DiscoveryChannelCard channel={CHANNEL} onTrack={onTrack} tracked />);
    expect(screen.getByRole("button", { name: "Tracking" })).toBeDisabled();
  });

  it("shows dashes for unknown metrics and makes no money claims", () => {
    const { container } = render(
      <DiscoveryChannelCard
        channel={{ ...CHANNEL, medianViewsRecent: null, contentType: null, viewsToSubs: null }}
      />,
    );
    expect(stat("Typical views")).toHaveTextContent("—");
    expect(stat("Content type")).toHaveTextContent("—");
    expect(container.textContent).not.toMatch(/revenue|RPM|\$|earn/i);
  });

  it("has no axe violations", async () => {
    const { container } = render(<DiscoveryChannelCard channel={CHANNEL} onTrack={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
