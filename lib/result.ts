// TRD.md §3.1: services return a typed Result instead of throwing for
// expected errors (rate limit, insufficient credits, invalid input).
// Shared here since lib/credits/, lib/youtube/, and every lib/services/
// module use the same shape.
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
