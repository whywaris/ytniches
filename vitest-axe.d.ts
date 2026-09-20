import "vitest";

interface AxeMatchers<R = unknown> {
  toHaveNoViolations(): R;
}

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging requires `interface`, not a type alias
  interface Assertion<T = unknown> extends AxeMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- declaration merging requires `interface`, not a type alias
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
