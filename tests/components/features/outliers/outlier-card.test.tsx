import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

// OutlierCard renders ThumbnailIdeasModal, which calls these Server
// Actions directly (same pattern as UpgradeModal) -- mocked so the module
// import doesn't reach real Supabase/AI code.
vi.mock("@/app/(app)/outliers/actions", () => ({
  generateThumbnailIdeasAction: vi.fn(),
  regenerateThumbnailIdeasAction: vi.fn(),
}));

import { OutlierCard } from "@/components/features/outliers/outlier-card";
import type { OutlierItem } from "@/lib/services/outliers";

function makeOutlier(overrides: Partial<OutlierItem> = {}): OutlierItem {
  return {
    id: "e1",
    channelId: "chan-1",
    channelName: "Sleep Sounds Daily",
    channelAvatarUrl: null,
    videoId: "vid-1",
    videoTitle: "8 Hours of Deep Sleep Music",
    videoThumbnailUrl: "https://example.com/thumb.jpg",
    viewCount: 500_000,
    baseline: 100_000,
    multiple: 5,
    outlierScore: 4.5,
    publishedAt: "2026-01-01T00:00:00Z",
    detectedAt: "2026-01-02T00:00:00Z",
    ...overrides,
  };
}

describe("OutlierCard", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<OutlierCard outlier={makeOutlier()} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the video title, score, and channel by default", () => {
    render(<OutlierCard outlier={makeOutlier()} />);

    expect(screen.getByText("8 Hours of Deep Sleep Music")).toBeInTheDocument();
    // D-085: the true multiple (views / baseline), not the decayed score (4.5).
    expect(screen.getByText("5.0x baseline")).toBeInTheDocument();
    expect(screen.queryByText("4.5x baseline")).not.toBeInTheDocument();
    expect(screen.getByText("Sleep Sounds Daily")).toBeInTheDocument();
  });

  it("shows when the video was published", () => {
    render(<OutlierCard outlier={makeOutlier()} />);
    const time = document.querySelector("time");
    expect(time?.getAttribute("dateTime")).toBe("2026-01-01T00:00:00Z");
    expect(time?.textContent).toMatch(/\b20\d\d\b/);
  });

  it("hides the channel row when showChannel is false", () => {
    render(<OutlierCard outlier={makeOutlier()} showChannel={false} />);

    expect(screen.queryByText("Sleep Sounds Daily")).not.toBeInTheDocument();
  });

  it("links Extract prompts to the deep-link URL with channel and video ids", () => {
    render(<OutlierCard outlier={makeOutlier()} />);

    expect(screen.getByRole("link", { name: "Extract prompts" })).toHaveAttribute(
      "href",
      "/prompts?channelId=chan-1&videoId=vid-1",
    );
  });

  it("opens ThumbnailIdeasModal when 'Get thumbnail ideas' is clicked", async () => {
    const user = userEvent.setup();
    render(<OutlierCard outlier={makeOutlier()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Get thumbnail ideas" }));

    expect(await screen.findByRole("dialog", { name: "Thumbnail ideas" })).toBeInTheDocument();
  });
});
