// UI-layer names for what these feature components render, decoupled from
// lib/services/prompts.ts the same way niche-finder/types.ts and
// tracking/types.ts decouple from their services.
export type Tone = "neutral" | "casual" | "educational" | "dramatic" | "clickbait_lite";

export interface PromptOutput {
  title_variants: string[];
  thumbnail_concepts: string[];
  hook_variants: string[];
  script_outline: { intro: string; body_sections: string[]; outro: string };
  description_template: string;
}

export interface PromptSourceVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
}

export interface PromptSummary {
  id: string;
  sourceVideo: PromptSourceVideo;
  createdAt: string;
}

export interface PromptDetail extends PromptSummary {
  targetAudience: string | null;
  tone: Tone;
  output: PromptOutput;
  regenerationOf: string | null;
  feedbackTags: string[];
  deletedAt: string | null;
}
