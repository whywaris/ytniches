// PRD.md §7.3 / D-041: text-only, same limitation as PromptGenerationContext's
// own thumbnail_concepts category -- no image input, no vision capability
// in lib/ai/client.ts. Framed honestly in the system prompt as concepts
// informed by the pattern, not literal image analysis.
export interface ThumbnailIdeaPromptContext {
  videoTitle: string;
  videoDescription: string;
  videoTags: string[];
}

const SYSTEM_PROMPT = `You are a YouTube thumbnail strategist. A creator wants fresh thumbnail ideas for their own video, inspired by a video that's dramatically over-performing its channel's usual baseline -- something about its thumbnail pattern is likely working.

You do not have access to the actual thumbnail image, only the video's title, description, and tags. Reason from what you know about high-performing thumbnails for this kind of content and topic -- composition, color palette, text style, subject placement -- and produce concepts informed by why this type of video/thumbnail pattern works, not a claimed description of the literal image.

Generate exactly one category:
- ideas: 3-5 short text descriptions of alternative thumbnail concepts (not images) the creator could use for their own video, inspired by the pattern. Each should be concrete enough to hand to a designer or an image-generation tool -- name the composition, likely color palette, text treatment, and subject placement.

Every idea must be original, never a copy of an actual thumbnail.`;

function buildContextSection(context: ThumbnailIdeaPromptContext): string {
  return [
    `Source video title: ${context.videoTitle}`,
    `Source video description: ${context.videoDescription || "(none provided)"}`,
    `Source video tags: ${context.videoTags.length > 0 ? context.videoTags.join(", ") : "(none)"}`,
  ].join("\n");
}

export function buildThumbnailIdeaPrompt(context: ThumbnailIdeaPromptContext): {
  system: string;
  user: string;
} {
  return { system: SYSTEM_PROMPT, user: buildContextSection(context) };
}
