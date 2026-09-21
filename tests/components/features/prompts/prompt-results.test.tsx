import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import { PromptResults } from "@/components/features/prompts/prompt-results";
import type { PromptOutput } from "@/components/features/prompts/types";

const OUTPUT: PromptOutput = {
  title_variants: ["Title A", "Title B", "Title C", "Title D", "Title E"],
  thumbnail_concepts: ["Concept X", "Concept Y", "Concept Z"],
  hook_variants: ["Hook 1", "Hook 2", "Hook 3"],
  script_outline: { intro: "Intro text", body_sections: ["Body 1", "Body 2"], outro: "Outro text" },
  description_template: "Description text",
};

describe("PromptResults", () => {
  it("has no accessibility violations in read-only mode", async () => {
    const { container } = render(<PromptResults output={OUTPUT} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations in editable mode", async () => {
    const { container } = render(<PromptResults output={OUTPUT} editable />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("renders all five category headings", () => {
    render(<PromptResults output={OUTPUT} />);
    expect(screen.getByText("Title variants")).toBeInTheDocument();
    expect(screen.getByText("Thumbnail concepts")).toBeInTheDocument();
    expect(screen.getByText("Hook variants")).toBeInTheDocument();
    expect(screen.getByText("Script outline")).toBeInTheDocument();
    expect(screen.getByText("Description template")).toBeInTheDocument();
  });

  it("copies a title variant's text when its copy button is clicked", async () => {
    const user = userEvent.setup();
    // userEvent.setup() installs its own clipboard stub on first use, which
    // would clobber a beforeEach-installed one -- spy only after it's set up.
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    render(<PromptResults output={OUTPUT} />);

    const titleRow = screen.getByText("Title A").closest("li")!;
    const copyButton = within(titleRow).getByRole("button", { name: "Copy" });
    await user.click(copyButton);

    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith("Title A"));
  });

  it("does not show a Save changes button when not editable", () => {
    render(<PromptResults output={OUTPUT} />);
    expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();
  });

  it("disables Save changes until the draft actually differs from the original", async () => {
    const user = userEvent.setup();
    render(<PromptResults output={OUTPUT} editable />);

    expect(screen.getByRole("button", { name: "Save changes" })).toBeDisabled();

    await user.clear(screen.getByLabelText("Title variant 1"));
    await user.type(screen.getByLabelText("Title variant 1"), "Edited title");

    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });

  it("calls onSave with the edited output", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<PromptResults output={OUTPUT} editable onSave={onSave} />);

    await user.clear(screen.getByLabelText("Title variant 1"));
    await user.type(screen.getByLabelText("Title variant 1"), "Edited title");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title_variants: expect.arrayContaining(["Edited title"]) }),
    );
  });
});
