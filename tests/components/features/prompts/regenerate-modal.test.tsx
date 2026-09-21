import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { RegenerateModal } from "@/components/features/prompts/regenerate-modal";
import type { PromptOutput } from "@/components/features/prompts/types";
import { err, ok } from "@/lib/result";

const OUTPUT: PromptOutput = {
  title_variants: ["A", "B", "C", "D", "E"],
  thumbnail_concepts: ["X", "Y", "Z"],
  hook_variants: ["H1", "H2", "H3"],
  script_outline: { intro: "Intro", body_sections: ["Body"], outro: "Outro" },
  description_template: "Description",
};

describe("RegenerateModal", () => {
  it("has no accessibility violations while open", async () => {
    const { baseElement } = render(
      <RegenerateModal open onOpenChange={vi.fn()} onRegenerate={vi.fn()} />,
    );
    expect(await axe(baseElement)).toHaveNoViolations();
  });

  it("renders nothing accessible when closed", () => {
    render(<RegenerateModal open={false} onOpenChange={vi.fn()} onRegenerate={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("toggles a feedback chip's pressed state when clicked", async () => {
    const user = userEvent.setup();
    render(<RegenerateModal open onOpenChange={vi.fn()} onRegenerate={vi.fn()} />);

    const chip = screen.getByRole("button", { name: "More casual" });
    expect(chip).toHaveAttribute("aria-pressed", "false");

    await user.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");

    await user.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onRegenerate with selected tags and free text", async () => {
    const user = userEvent.setup();
    const onRegenerate = vi.fn().mockResolvedValue(ok(OUTPUT));
    render(<RegenerateModal open onOpenChange={vi.fn()} onRegenerate={onRegenerate} />);

    await user.click(screen.getByRole("button", { name: "More casual" }));
    await user.click(screen.getByRole("button", { name: "Shorter" }));
    await user.type(screen.getByLabelText("Additional feedback"), "Make it punchier");
    await user.click(screen.getByRole("button", { name: "Regenerate · Uses 3 credits" }));

    expect(onRegenerate).toHaveBeenCalledWith({
      tags: ["more_casual", "shorter"],
      freeText: "Make it punchier",
    });
  });

  it("on success, calls onRegenerated with the new output and closes", async () => {
    const user = userEvent.setup();
    const onRegenerated = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <RegenerateModal
        open
        onOpenChange={onOpenChange}
        onRegenerate={vi.fn().mockResolvedValue(ok(OUTPUT))}
        onRegenerated={onRegenerated}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Regenerate · Uses 3 credits" }));

    await vi.waitFor(() => expect(onRegenerated).toHaveBeenCalledWith(OUTPUT));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("on failure, shows an inline error and stays open", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <RegenerateModal
        open
        onOpenChange={onOpenChange}
        onRegenerate={vi
          .fn()
          .mockResolvedValue(err({ type: "failed", message: "AI provider timed out." }))}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Regenerate · Uses 3 credits" }));

    expect(await screen.findByText("AI provider timed out.")).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });

  it("on insufficient credits, shows the balance/required message", async () => {
    const user = userEvent.setup();
    render(
      <RegenerateModal
        open
        onOpenChange={vi.fn()}
        onRegenerate={vi
          .fn()
          .mockResolvedValue(err({ type: "insufficient_credits", balance: 1, required: 3 }))}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Regenerate · Uses 3 credits" }));

    expect(await screen.findByText("Not enough credits (1 of 3 needed).")).toBeInTheDocument();
  });

  it("clicking Cancel closes without calling onRegenerate", async () => {
    const user = userEvent.setup();
    const onRegenerate = vi.fn();
    const onOpenChange = vi.fn();
    render(<RegenerateModal open onOpenChange={onOpenChange} onRegenerate={onRegenerate} />);

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onRegenerate).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
