import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { PromptCard } from "@/components/features/prompts/prompt-card";
import type { PromptSummary } from "@/components/features/prompts/types";

const PROMPT: PromptSummary = {
  id: "prompt-1",
  sourceVideo: { id: "vid-1", title: "How to pick a niche", thumbnailUrl: "" },
  createdAt: "2026-01-01T00:00:00Z",
};

describe("PromptCard", () => {
  it("has no accessibility violations", async () => {
    const { container } = render(<PromptCard prompt={PROMPT} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("shows the source video title", () => {
    render(<PromptCard prompt={PROMPT} />);
    expect(screen.getByText("How to pick a niche")).toBeInTheDocument();
  });

  it("calls onOpen with the prompt id when clicked", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(<PromptCard prompt={PROMPT} onOpen={onOpen} />);

    await user.click(screen.getByText("How to pick a niche"));

    expect(onOpen).toHaveBeenCalledWith("prompt-1");
  });
});
