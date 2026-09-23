import type { ComponentProps } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

const generateThumbnailIdeasAction = vi.fn();
const regenerateThumbnailIdeasAction = vi.fn();
vi.mock("@/app/(app)/outliers/actions", () => ({
  generateThumbnailIdeasAction: (...args: unknown[]) => generateThumbnailIdeasAction(...args),
  regenerateThumbnailIdeasAction: (...args: unknown[]) => regenerateThumbnailIdeasAction(...args),
}));

import { ThumbnailIdeasModal } from "@/components/features/outliers/thumbnail-ideas-modal";

const VIDEO = {
  id: "vid-1",
  title: "8 Hours of Deep Sleep Music",
  thumbnailUrl: "https://example.com/thumb.jpg",
};

function renderModal(overrides: Partial<ComponentProps<typeof ThumbnailIdeasModal>> = {}) {
  return render(<ThumbnailIdeasModal open onOpenChange={vi.fn()} video={VIDEO} {...overrides} />);
}

describe("ThumbnailIdeasModal", () => {
  it("has no accessibility violations in the idle state", async () => {
    const { baseElement } = renderModal();
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it("shows the source video and an idle Generate button", () => {
    renderModal();

    expect(screen.getByText("8 Hours of Deep Sleep Music")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate thumbnail ideas · Uses 5 credits" }),
    ).toBeInTheDocument();
  });

  it("generates and shows 3-5 copy-able idea cards on success", async () => {
    const user = userEvent.setup();
    generateThumbnailIdeasAction.mockResolvedValueOnce({
      ok: true,
      value: { id: "set-1", ideas: ["Idea A", "Idea B", "Idea C"] },
    });
    renderModal();

    await user.click(
      screen.getByRole("button", { name: "Generate thumbnail ideas · Uses 5 credits" }),
    );

    expect(await screen.findByText("Idea A")).toBeInTheDocument();
    expect(screen.getByText("Idea B")).toBeInTheDocument();
    expect(screen.getByText("Idea C")).toBeInTheDocument();
    expect(generateThumbnailIdeasAction).toHaveBeenCalledWith("vid-1", expect.any(String));
    expect(
      screen.getByRole("button", { name: "Generate another · Uses 5 credits" }),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations once results are shown", async () => {
    const user = userEvent.setup();
    generateThumbnailIdeasAction.mockResolvedValueOnce({
      ok: true,
      value: { id: "set-1", ideas: ["Idea A", "Idea B", "Idea C"] },
    });
    const { baseElement } = renderModal();

    await user.click(
      screen.getByRole("button", { name: "Generate thumbnail ideas · Uses 5 credits" }),
    );
    await screen.findByText("Idea A");

    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it("shows an insufficient-credits message with an Upgrade link", async () => {
    const user = userEvent.setup();
    generateThumbnailIdeasAction.mockResolvedValueOnce({
      ok: false,
      error: { type: "insufficient_credits", balance: 2, required: 5 },
    });
    renderModal();

    await user.click(
      screen.getByRole("button", { name: "Generate thumbnail ideas · Uses 5 credits" }),
    );

    expect(await screen.findByText("Not enough credits (2 of 5 needed).")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Upgrade" })).toHaveAttribute(
      "href",
      "/settings/billing",
    );
  });

  it("shows a failure message for a generation_failed error", async () => {
    const user = userEvent.setup();
    generateThumbnailIdeasAction.mockResolvedValueOnce({
      ok: false,
      error: { type: "generation_failed", message: "The AI provider is overloaded." },
    });
    renderModal();

    await user.click(
      screen.getByRole("button", { name: "Generate thumbnail ideas · Uses 5 credits" }),
    );

    expect(await screen.findByText("The AI provider is overloaded.")).toBeInTheDocument();
  });

  it("regenerates in place, calling the regenerate action with the previous set id", async () => {
    const user = userEvent.setup();
    generateThumbnailIdeasAction.mockResolvedValueOnce({
      ok: true,
      value: { id: "set-1", ideas: ["Idea A", "Idea B", "Idea C"] },
    });
    regenerateThumbnailIdeasAction.mockResolvedValueOnce({
      ok: true,
      value: { id: "set-2", ideas: ["Idea X", "Idea Y", "Idea Z"] },
    });
    renderModal();

    await user.click(
      screen.getByRole("button", { name: "Generate thumbnail ideas · Uses 5 credits" }),
    );
    await screen.findByText("Idea A");

    await user.click(screen.getByRole("button", { name: "Generate another · Uses 5 credits" }));

    expect(regenerateThumbnailIdeasAction).toHaveBeenCalledWith("set-1", expect.any(String));
    expect(await screen.findByText("Idea X")).toBeInTheDocument();
    expect(screen.queryByText("Idea A")).not.toBeInTheDocument();
  });

  it("resets to idle when closed and reopened", async () => {
    const user = userEvent.setup();
    generateThumbnailIdeasAction.mockResolvedValueOnce({
      ok: true,
      value: { id: "set-1", ideas: ["Idea A", "Idea B", "Idea C"] },
    });
    const onOpenChange = vi.fn();
    const { rerender } = renderModal({ onOpenChange });

    await user.click(
      screen.getByRole("button", { name: "Generate thumbnail ideas · Uses 5 credits" }),
    );
    await screen.findByText("Idea A");

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);

    rerender(<ThumbnailIdeasModal open={false} onOpenChange={onOpenChange} video={VIDEO} />);
    rerender(<ThumbnailIdeasModal open onOpenChange={onOpenChange} video={VIDEO} />);

    expect(
      screen.getByRole("button", { name: "Generate thumbnail ideas · Uses 5 credits" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Idea A")).not.toBeInTheDocument();
  });
});
