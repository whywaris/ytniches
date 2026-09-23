import { z } from "zod";

// PRD.md §8.2. .strict() rejects unknown fields (Security.md §4.3,
// CLAUDE.md §2.2).
export const CreateTaskInputSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).optional(),
    assigneeId: z.string().uuid().optional(),
    dueDate: z.string().date().optional(),
    linkedType: z.enum(["channel", "prompt", "calendar_entry"]).optional(),
    linkedId: z.string().uuid().optional(),
  })
  .strict();
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

export const UpdateTaskInputSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    assigneeId: z.string().uuid().nullable().optional(),
    dueDate: z.string().date().nullable().optional(),
    status: z.enum(["open", "in_progress", "done"]).optional(),
  })
  .strict();
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;
