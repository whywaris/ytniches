import { z } from "zod";

// Trust boundary (CLAUDE.md §2.2): the AI provider's response is untrusted
// third-party output, validated here before it's stored in prompts.output
// or shown to the user. Bounds match PRD.md §6.3's category counts.
export const PromptOutputSchema = z.object({
  title_variants: z.array(z.string()).min(5).max(10),
  thumbnail_concepts: z.array(z.string()).min(3).max(5),
  hook_variants: z.array(z.string()).min(3).max(5),
  script_outline: z.object({
    intro: z.string(),
    body_sections: z.array(z.string()).min(1),
    outro: z.string(),
  }),
  description_template: z.string(),
});

export type PromptOutput = z.infer<typeof PromptOutputSchema>;
