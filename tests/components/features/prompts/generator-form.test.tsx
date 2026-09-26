import type { ComponentProps } from "react";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { describe, expect, it, vi } from "vitest";

import {
  GeneratorForm,
  type GenerateInput,
  type VideoPickerChannel,
  type VideoPickerVideo,
} from "@/components/features/prompts/generator-form";
import type { PromptOutput } from "@/components/features/prompts/types";
import { err, ok } from "@/lib/result";

const OUTPUT: PromptOutput = {
  title_variants: ["A", "B", "C", "D", "E"],
  thumbnail_concepts: ["X", "Y", "Z"],
  hook_variants: ["H1", "H2", "H3"],
  script_outline: { intro: "Intro", body_sections: ["Body"], outro: "Outro" },
  description_template: "Description",
};

const CHANNELS: VideoPickerChannel[] = [{ id: "chan-1", name: "Sleep Sounds Daily" }];
const VIDEOS: VideoPickerVideo[] = [
  { id: "vid-1", title: "8 Hours of Deep Sleep", viewCount: 1000 },
];

function renderForm(overrides: Partial<ComponentProps<typeof GeneratorForm>> = {}) {
  const props = {
    trackedChannels: CHANNELS,
    onListTopVideos: vi.fn().mockResolvedValue(VIDEOS),
    onGenerate: vi.fn().mockResolvedValue(ok({ id: "prompt-1", output: OUTPUT })),
    onGenerated: vi.fn(),
    ...overrides,
  };
  const utils = render(<GeneratorForm {...props} />);
  return { ...utils, ...props };
}

// Keyboard, not clicks: under isolate: false the jsdom document outlives
// each test file, and an earlier file's user-event pointer state on it
// (e.g. table.test.tsx's clicks) stops a click from opening the Select.
// Only shows up with CI's uncached file order on one worker.
async function pickChannelAndVideo(user: ReturnType<typeof userEvent.setup>) {
  screen.getByRole("combobox", { name: "Tracked channel" }).focus();
  await user.keyboard("{Enter}");
  await screen.findByRole("option", { name: "Sleep Sounds Daily" });
  await user.keyboard("{Enter}");
  (await screen.findByRole("combobox", { name: "Video" })).focus();
  await user.keyboard("{Enter}");
  await screen.findByRole("option", { name: /8 Hours of Deep Sleep/ });
  await user.keyboard("{Enter}");
}

// The other state-transition tests below (results/error rendering, reset)
// don't care which tab produced the input -- they go through the URL tab's
// plain text field instead of re-opening a Radix Select, since Radix's
// DismissableLayer leaves stale document-level listeners across renders
// under this project's shared-environment vitest config (isolate: false),
// which dismisses a second test's Select the instant it opens.
async function enterUrl(user: ReturnType<typeof userEvent.setup>, url: string) {
  await user.click(screen.getByRole("tab", { name: "From URL" }));
  await user.type(screen.getByLabelText("Video URL"), url);
}

describe("GeneratorForm", () => {
  it("has no accessibility violations in the idle state", async () => {
    const { container } = renderForm();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("disables Generate until a video is picked", () => {
    renderForm();
    expect(screen.getByRole("button", { name: /Generate prompts/ })).toBeDisabled();
  });

  it("channel tab: picking a channel loads its videos, and picking a video enables Generate", async () => {
    const user = userEvent.setup();
    const { onListTopVideos } = renderForm();

    await pickChannelAndVideo(user);

    expect(onListTopVideos).toHaveBeenCalledWith("chan-1");
    expect(screen.getByRole("button", { name: /Generate prompts/ })).toBeEnabled();
  });

  it("url tab: enables Generate once a URL is entered and generates from it", async () => {
    const user = userEvent.setup();
    const { onGenerate, onGenerated } = renderForm();

    await user.click(screen.getByRole("tab", { name: "From URL" }));
    expect(screen.getByRole("button", { name: /Generate prompts/ })).toBeDisabled();

    await enterUrl(user, "https://youtube.com/watch?v=abc123");
    expect(screen.getByRole("button", { name: /Generate prompts/ })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /Generate prompts/ }));

    expect(onGenerate).toHaveBeenCalledWith({
      videoUrl: "https://youtube.com/watch?v=abc123",
      targetAudience: null,
      tone: "neutral",
    } satisfies GenerateInput);
    expect(await screen.findByText("Title variants")).toBeInTheDocument();
    expect(onGenerated).toHaveBeenCalledWith("prompt-1");
  });

  it("shows an insufficient-credits message and stays on the form", async () => {
    const user = userEvent.setup();
    renderForm({
      onGenerate: vi
        .fn()
        .mockResolvedValue(err({ type: "insufficient_credits", balance: 2, required: 5 })),
    });

    await enterUrl(user, "https://youtube.com/watch?v=abc123");
    await user.click(screen.getByRole("button", { name: /Generate prompts/ }));

    expect(await screen.findByText("Not enough credits (2 of 5 needed).")).toBeInTheDocument();
  });

  it("shows a failure message and does not charge, per copy", async () => {
    const user = userEvent.setup();
    renderForm({
      onGenerate: vi
        .fn()
        .mockResolvedValue(err({ type: "failed", message: "The AI provider is overloaded." })),
    });

    await enterUrl(user, "https://youtube.com/watch?v=abc123");
    await user.click(screen.getByRole("button", { name: /Generate prompts/ }));

    expect(
      await screen.findByText(/Your credit was not charged\. The AI provider is overloaded\./),
    ).toBeInTheDocument();
  });

  it("seeds the channel/video selection from initialSelection (outlier deep link)", async () => {
    const user = userEvent.setup();
    const { onGenerate } = renderForm({
      initialSelection: { channelId: "chan-1", videoId: "vid-1", videos: VIDEOS },
    });

    // Already enabled -- no need to open either Select.
    expect(screen.getByRole("button", { name: /Generate prompts/ })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /Generate prompts/ }));

    expect(onGenerate).toHaveBeenCalledWith({
      videoId: "vid-1",
      targetAudience: null,
      tone: "neutral",
    } satisfies GenerateInput);
  });

  it("'Generate another' returns to the idle form", async () => {
    const user = userEvent.setup();
    renderForm();

    await enterUrl(user, "https://youtube.com/watch?v=abc123");
    await user.click(screen.getByRole("button", { name: /Generate prompts/ }));

    await user.click(await screen.findByRole("button", { name: "Generate another" }));

    expect(screen.getByRole("button", { name: /Generate prompts/ })).toBeInTheDocument();
  });

  it("Discard asks for confirmation, then calls onDiscard and returns to idle", async () => {
    const user = userEvent.setup();
    const onDiscard = vi.fn().mockResolvedValue(undefined);
    renderForm({ onDiscard });

    await enterUrl(user, "https://youtube.com/watch?v=abc123");
    await user.click(screen.getByRole("button", { name: /Generate prompts/ }));
    await user.click(await screen.findByRole("button", { name: "Discard" }));

    const dialog = await screen.findByRole("dialog");
    expect(onDiscard).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Discard" }));

    expect(onDiscard).toHaveBeenCalledWith("prompt-1");
    await screen.findByRole("button", { name: /Generate prompts/ });
  });
});
