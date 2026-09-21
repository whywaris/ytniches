import { z } from "zod";

// PRD.md §6.1 Niche Finder filters. .strict() rejects unknown fields
// (Security.md §4.3, CLAUDE.md §2.2). Shared between the Server Action
// (app/actions/niches.ts) and, later, client-side form validation — a
// "use server" file can only export async functions, so this can't live
// alongside the action itself.
export const NicheSearchInputSchema = z
  .object({
    keyword: z.string().max(200).optional(),
    subscribersMin: z.number().int().min(0).optional(),
    subscribersMax: z.number().int().min(0).optional(),
    avgViewsMin: z.number().int().min(0).optional(),
    avgViewsMax: z.number().int().min(0).optional(),
    uploadFrequency: z.enum(["any", "weekly", "2-4-week", "daily-plus"]).default("any"),
    monetized: z.enum(["any", "yes", "no"]).default("any"),
    languages: z.array(z.string().length(2)).max(10).optional(),
    countries: z.array(z.string().length(2)).max(10).optional(),
    createdAfter: z.string().datetime().optional(),
    sort: z.enum(["relevance", "subscribers", "avg_views", "upload_freq"]).default("relevance"),
    page: z.number().int().min(1).default(1),
  })
  .strict();

export type NicheSearchInput = z.infer<typeof NicheSearchInputSchema>;
