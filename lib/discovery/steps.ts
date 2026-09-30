import { NonRetriableError } from "inngest";

import type { Result } from "@/lib/result";
import type { DiscoveryYouTubeError } from "@/lib/youtube/discovery";

// D-078: every paid YouTube call in a discovery job runs in its own step.
// In a worker this is Inngest's step.run, which memoises a finished step's
// output, so a retry resumes at the step that failed and never re-pays for
// calls that already succeeded. Outside a job (tests, scripts) steps just
// run. Step outputs go through JSON, so return plain data, not Maps.
export type StepRunner = (id: string, fn: () => Promise<unknown>) => Promise<unknown>;

export const runDirect: StepRunner = (_id, fn) => fn();

export async function inStep<T>(run: StepRunner, id: string, fn: () => Promise<T>): Promise<T> {
  return (await run(id, fn)) as T;
}

export function isBudgetStop(error: DiscoveryYouTubeError): boolean {
  return error.type === "budget_exhausted" || error.type === "quota_exceeded";
}

// For use inside a step. A budget stop is returned so the job can stop
// cleanly. Anything else throws, so the step is not memoised: a transient
// error retries just this step, and a malformed response -- which would be
// malformed again -- fails without retrying.
export function budgetStopOrThrow<T>(
  result: Result<T, DiscoveryYouTubeError>,
  what: string,
): Result<T, DiscoveryYouTubeError> {
  if (result.ok || isBudgetStop(result.error)) return result;
  const message = `${what} failed: ${result.error.type}`;
  if (result.error.type === "invalid_response") throw new NonRetriableError(message);
  throw new Error(message);
}
