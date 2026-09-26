import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { NicheCard } from "@/components/features/niche-finder/niche-card";

import { NICHE } from "./fixtures";

describe("NicheCard (spec §9.2)", () => {
  it("shows the score, 7-day trend, both why chips and mini stats", () => {
    render(<NicheCard niche={NICHE} />);
    expect(screen.getByLabelText("Opportunity score 84 out of 100")).toHaveTextContent("84");
    expect(screen.getByText("+12")).toBeInTheDocument();
    expect(screen.getByText("62% small channels ranking")).toBeInTheDocument();
    expect(screen.getByText("4 new channels breaking out")).toBeInTheDocument();
    expect(screen.getByText("Rising")).toBeInTheDocument();
    expect(screen.getByText("Low competition")).toBeInTheDocument();
    expect(screen.getByText("18.4K")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(3);
  });

  it("links to the niche page and the prompt generator for its top outlier", () => {
    render(<NicheCard niche={NICHE} />);
    expect(screen.getByRole("link", { name: "View niche" })).toHaveAttribute(
      "href",
      "/niches/mafia-history",
    );
    expect(screen.getByRole("link", { name: "Generate prompts" })).toHaveAttribute(
      "href",
      "/prompts?channelId=c1&videoId=vid-1",
    );
  });

  it("calls onTrack with the slug", async () => {
    const onTrack = vi.fn();
    render(<NicheCard niche={NICHE} onTrack={onTrack} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Track" }));
    expect(onTrack).toHaveBeenCalledWith("mafia-history");
  });

  it("marks a niche with no history as new instead of a trend", () => {
    render(<NicheCard niche={{ ...NICHE, trend: null }} />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<NicheCard niche={NICHE} onTrack={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
