import { z } from "zod";

// PRD.md §6.4, UI-UX-Flow.md §3 Step 1. .strict() rejects unknown fields
// (Security.md §4.3, CLAUDE.md §2.2). primary_goal's values mirror the
// profiles_primary_goal_check DB constraint (supabase/migrations/
// 20260920095003_create_profiles.sql) -- kept in sync by hand, same as
// every other enum-shaped Zod schema in this codebase.
export const PrimaryGoalSchema = z.enum(["explorer", "stuck", "grower", "operator"]);

export const UpdateProfileInputSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    primaryGoal: PrimaryGoalSchema,
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof UpdateProfileInputSchema>;

// onboarding_step: 0 (not started) through 5 (completed) -- Backend-Schema.md
// §2.2. Value 3 is reserved but never persisted (Steps 3+4 share one
// screen -- see app/(app)/onboarding/page.tsx), but the schema doesn't
// need to know that -- it just bounds the column's valid range.
export const OnboardingStepSchema = z.number().int().min(0).max(5);
