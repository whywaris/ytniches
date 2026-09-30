import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { TOOLS } from "@/lib/tools/registry";
import { YouTubeAttribution } from "@/components/features/youtube/youtube-attribution";

describe("YouTubeAttribution", () => {
  it("shows the official developed-with-YouTube logo linking to YouTube, accessibly (D-084)", async () => {
    const { container } = render(<YouTubeAttribution />);
    const link = screen.getAllByRole("link", { name: "Developed with YouTube" });
    expect(link).toHaveLength(1);
    expect(link[0]).toHaveAttribute("href", "https://www.youtube.com");
    // Both theme variants, one hidden by CSS; the app theme picks.
    expect(container.querySelectorAll("img")).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders only the white-text logo on always-dark surfaces", () => {
    const { container } = render(<YouTubeAttribution tone="dark" />);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(1);
    expect(images[0]!.getAttribute("src")).toContain("sentence-case-light");
  });

  it("is flagged on every free tool that shows YouTube data", () => {
    const flagged = TOOLS.filter((tool) => tool.youtubeData).map((tool) => tool.slug);
    expect(flagged.sort()).toEqual(
      [
        "rss-feed-generator",
        "tag-extractor",
        "youtube-channel-id-finder",
        "youtube-outlier-checker",
        "youtube-subscribe-link-generator",
        "youtube-thumbnail-download",
      ].sort(),
    );
  });
});
