// Interaction-Spec "Global CTA button hover": 2px lift + shadow on hover,
// back to base on press; touch gets a 0.98 tap-scale instead of a lift.
// A plain module on purpose: importing this string from a "use client"
// file into a server component (vs-section.tsx) yields a client reference,
// not the string, and the page renders a function's source as a class.
export const LIFT =
  "transition-[transform,box-shadow,background-color] duration-fast ease-out " +
  "[@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-md " +
  "active:translate-y-0 [@media(hover:none)]:active:scale-[0.98] motion-reduce:hover:translate-y-0";
