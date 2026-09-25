import { ToolIndex } from "@/components/features/tools/tool-page";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free YouTube Tools — No Signup Needed | YTNiches",
  description:
    "Free YouTube tools for faceless creators: outlier checker, channel ID finder, subscribe links, RSS feeds, embed codes and a thumbnail resizer. No signup.",
  alternates: { canonical: "/tools" },
};

// D-014: every tool works without an account.
export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-6 py-12 md:px-10 md:py-16">
      <h1 className="text-display-sm font-semibold tracking-tight text-text-primary">
        Free YouTube tools
      </h1>
      <p className="mt-3 max-w-2xl text-body-lg text-text-secondary">
        Small jobs, done fast. No signup, no credit card.
      </p>
      <div className="mt-10">
        <ToolIndex />
      </div>
    </div>
  );
}
