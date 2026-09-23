import { z } from "zod";

// PRD.md §8.3. .strict() rejects unknown fields (Security.md §4.3,
// CLAUDE.md §2.2).
export const CreateCalendarEntryInputSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).optional(),
    channelId: z.string().uuid().optional(),
    linkedPrompts: z.array(z.string().uuid()).max(20).optional(),
    status: z.enum(["idea", "scripted", "filmed", "edited", "published"]).optional(),
    scheduledFor: z.string().datetime().optional(),
    assigneeId: z.string().uuid().optional(),
  })
  .strict();
export type CreateCalendarEntryInput = z.infer<typeof CreateCalendarEntryInputSchema>;

export const UpdateCalendarEntryInputSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    channelId: z.string().uuid().nullable().optional(),
    linkedPrompts: z.array(z.string().uuid()).max(20).optional(),
    status: z.enum(["idea", "scripted", "filmed", "edited", "published"]).optional(),
    scheduledFor: z.string().datetime().nullable().optional(),
    assigneeId: z.string().uuid().nullable().optional(),
  })
  .strict();
export type UpdateCalendarEntryInput = z.infer<typeof UpdateCalendarEntryInputSchema>;

export const ListCalendarEntriesFilterSchema = z
  .object({
    status: z.enum(["idea", "scripted", "filmed", "edited", "published"]).optional(),
    assigneeId: z.string().uuid().optional(),
    channelId: z.string().uuid().optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })
  .strict();
export type ListCalendarEntriesFilter = z.infer<typeof ListCalendarEntriesFilterSchema>;
