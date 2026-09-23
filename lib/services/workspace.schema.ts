import { z } from "zod";

// PRD.md §8.1. .strict() rejects unknown fields (Security.md §4.3,
// CLAUDE.md §2.2).
export const CreateWorkspaceInputSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
  })
  .strict();
export type CreateWorkspaceInput = z.infer<typeof CreateWorkspaceInputSchema>;

export const InviteMemberInputSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(255),
    role: z.enum(["admin", "editor", "viewer"]),
  })
  .strict();
export type InviteMemberInput = z.infer<typeof InviteMemberInputSchema>;

export const UpdateMemberRoleInputSchema = z
  .object({
    role: z.enum(["admin", "editor", "viewer"]),
  })
  .strict();
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleInputSchema>;
