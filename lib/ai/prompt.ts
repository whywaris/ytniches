const TONE_LABELS: Record<PromptGenerationContext["tone"], string> = {
  neutral: "neutral",
  casual: "casual and conversational",
  educational: "educational and clear",
  dramatic: "dramatic and high-energy",
  clickbait_lite: "attention-grabbing but not misleading (light clickbait)",
};

export interface PromptGenerationContext {
  videoTitle: string;
  videoDescription: string;
  videoTags: string[];
  // D-027: null when the transcript couldn't be fetched (soft-degrade, not
  // a blocker) -- UI-UX-Flow.md §7.6's deviation note.
  transcriptText: string | null;
  targetAudience: string | null;
  tone: "neutral" | "casual" | "educational" | "dramatic" | "clickbait_lite";
  // Present only for a regeneration (Application-Flow.md §4.3 regenerating
  // state) -- UI-UX-Flow.md §7.5's feedback chips + free text.
  feedback?: { tags: string[]; freeText: string | null };
}

const SYSTEM_PROMPT = `You are a YouTube content strategist helping a creator turn a competitor's successful video into ready-to-use ideas for their own channel, in their own voice -- never a copy of the source video.

Generate exactly five categories of output:
1. title_variants: 5-10 alternative titles inspired by the source video's title pattern, adapted to the creator's own content.
2. thumbnail_concepts: 3-5 short text descriptions of thumbnail concepts (not images) inspired by the source video.
3. hook_variants: 3-5 alternative opening hook lines for the first ~30 seconds of a video. When a transcript is provided, base these on its actual opening. When no transcript is available, infer plausible hooks from the title and description instead -- say so is not necessary, just produce strong hooks either way.
4. script_outline: a structured outline (intro / body_sections / outro) -- an outline only, never a full script.
5. description_template: a ready-to-paste video description template.

Every output must be original content inspired by the source, never a copy of its actual text.`;

function buildContextSection(context: PromptGenerationContext): string {
  const lines = [
    `Source video title: ${context.videoTitle}`,
    `Source video description: ${context.videoDescription || "(none provided)"}`,
    `Source video tags: ${context.videoTags.length > 0 ? context.videoTags.join(", ") : "(none)"}`,
    context.transcriptText
      ? `Source video transcript (opening excerpt): ${context.transcriptText.slice(0, 4000)}`
      : "Source video transcript: not available -- infer hook_variants from the title and description instead.",
    `Desired tone: ${TONE_LABELS[context.tone]}`,
  ];
  if (context.targetAudience) {
    lines.push(`Target audience: ${context.targetAudience}`);
  }
  return lines.join("\n");
}

function buildFeedbackSection(feedback: PromptGenerationContext["feedback"]): string | null {
  if (!feedback || (feedback.tags.length === 0 && !feedback.freeText)) {
    return null;
  }
  const parts = ["This is a regeneration. Apply this feedback to the new output:"];
  if (feedback.tags.length > 0) {
    parts.push(`Requested adjustments: ${feedback.tags.join(", ").replace(/_/g, " ")}`);
  }
  if (feedback.freeText) {
    parts.push(`Additional feedback: ${feedback.freeText}`);
  }
  return parts.join("\n");
}

export function buildPrompt(context: PromptGenerationContext): { system: string; user: string } {
  const sections = [buildContextSection(context)];
  const feedbackSection = buildFeedbackSection(context.feedback);
  if (feedbackSection) {
    sections.push(feedbackSection);
  }
  return { system: SYSTEM_PROMPT, user: sections.join("\n\n") };
}
