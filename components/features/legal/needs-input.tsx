import type { ReactNode } from "react";

// A visible gap in a legal page, for the owner to fill before launch.
// tests/content/legal.test.ts lists every open one.
function NeedsInput({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded-sm bg-warning/20 px-1 font-semibold text-warning">
      [NEEDS MAC INPUT: {children}]
    </mark>
  );
}

export { NeedsInput };
