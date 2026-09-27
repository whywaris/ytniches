import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";

import { TOOLS } from "@/lib/tools/registry";
import { YouTubeAttribution } from "@/components/features/youtube/youtube-attribution";

describe("YouTubeAttribution", () => {
  it("names YouTube as the source with a link, accessibly", async () => {
    const { container } = render(<YouTubeAttribution />);
    expect(screen.getByText(/Data from/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "YouTube" })).toHaveAttribute(
      "href",
      "https://www.youtube.com",
    );
    expect(await axe(container)).toHaveNoViolations();
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
