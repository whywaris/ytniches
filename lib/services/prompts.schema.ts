import { z } from "zod";

// PRD.md §6.3, UI-UX-Flow.md §7.1. .strict() rejects unknown fields
// (Security.md §4.3, CLAUDE.md §2.2). Shared between the Server Action
// (app/(app)/prompts/actions.ts) and client-side form validation.
const TONE_VALUES = ["neutral", "casual", "educational", "dramatic", "clickbait_lite"] as const;

export const GeneratePromptsInputSchema = z
  .object({
    targetAudience: z.string().max(200).nullable(),
    tone: z.enum(TONE_VALUES),
    videoId: z.string().uuid().optional(),
    videoUrl: z.string().url().max(2000).optional(),
  })
  .strict()
  .refine((input) => Boolean(input.videoId) !== Boolean(input.videoUrl), {
    message: "Provide exactly one of videoId or videoUrl.",
  });

export type GeneratePromptsInput = z.infer<typeof GeneratePromptsInputSchema>;

export const RegeneratePromptsInputSchema = z
  .object({
    tags: z.array(z.string().max(50)).max(10),
    freeText: z.string().max(1000).nullable(),
  })
  .strict();

export type RegeneratePromptsInput = z.infer<typeof RegeneratePromptsInputSchema>;
