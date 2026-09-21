import { describe, expect, it } from "vitest";

import { buildPrompt, type PromptGenerationContext } from "@/lib/ai/prompt";

function makeContext(overrides: Partial<PromptGenerationContext> = {}): PromptGenerationContext {
  return {
    videoTitle: "How I Grew to 1M Subs",
    videoDescription: "My full journey.",
    videoTags: ["growth", "youtube"],
    transcriptText: null,
    targetAudience: null,
    tone: "neutral",
    ...overrides,
  };
}

describe("buildPrompt", () => {
  it("includes the video title, description, and tags in the user prompt", () => {
    const { user } = buildPrompt(makeContext());

    expect(user).toContain("How I Grew to 1M Subs");
    expect(user).toContain("My full journey.");
    expect(user).toContain("growth, youtube");
  });

  it("tells the model to infer hooks from title+description when no transcript is available", () => {
    const { user } = buildPrompt(makeContext({ transcriptText: null }));

    expect(user).toMatch(/not available.*infer hook_variants/i);
  });

  it("includes the transcript excerpt when one is available", () => {
    const { user } = buildPrompt(makeContext({ transcriptText: "Hey everyone, welcome back..." }));

    expect(user).toContain("Hey everyone, welcome back...");
    expect(user).not.toMatch(/not available/i);
  });

  it("truncates a very long transcript rather than sending it in full", () => {
    const longTranscript = "word ".repeat(2000);
    const { user } = buildPrompt(makeContext({ transcriptText: longTranscript }));

    expect(user.length).toBeLessThan(longTranscript.length);
  });

  it("includes the target audience only when provided", () => {
    const withAudience = buildPrompt(makeContext({ targetAudience: "beginners" })).user;
    const withoutAudience = buildPrompt(makeContext({ targetAudience: null })).user;

    expect(withAudience).toContain("Target audience: beginners");
    expect(withoutAudience).not.toContain("Target audience");
  });

  it("includes tone", () => {
    const { user } = buildPrompt(makeContext({ tone: "clickbait_lite" }));

    expect(user.toLowerCase()).toContain("clickbait");
  });

  it("omits the feedback section when there is no feedback", () => {
    const { user } = buildPrompt(makeContext());

    expect(user).not.toContain("regeneration");
  });

  it("includes feedback tags and free text when regenerating", () => {
    const { user } = buildPrompt(
      makeContext({ feedback: { tags: ["more_casual", "shorter"], freeText: "less corporate" } }),
    );

    expect(user).toContain("regeneration");
    expect(user).toContain("more casual, shorter");
    expect(user).toContain("less corporate");
  });

  it("the system prompt names all 5 categories", () => {
    const { system } = buildPrompt(makeContext());

    for (const category of [
      "title_variants",
      "thumbnail_concepts",
      "hook_variants",
      "script_outline",
      "description_template",
    ]) {
      expect(system).toContain(category);
    }
  });
});
