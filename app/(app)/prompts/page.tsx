import { getRequestContext } from "@/lib/context";
import { listPrompts } from "@/lib/services/prompts";
import { listTrackedChannelsSummary } from "@/lib/services/tracking";
import { PromptsClient } from "@/app/(app)/prompts/prompts-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Prompts — YTNiches",
};

const LIBRARY_PAGE_SIZE = 20;

// UI-UX-Flow.md §7.1: two-panel landing (library + generator entry). A
// Server Component for the first paint, same split as tracking/page.tsx --
// the interactive layer (search, tabs, generate, discard) lives in
// prompts-client.tsx.
export default async function PromptsPage() {
  const ctx = await getRequestContext();
  const [prompts, trackedChannels] = await Promise.all([
    listPrompts(ctx, { limit: LIBRARY_PAGE_SIZE }),
    listTrackedChannelsSummary(ctx),
  ]);

  return (
    <PromptsClient
      initialPrompts={prompts}
      trackedChannels={trackedChannels.map((channel) => ({ id: channel.id, name: channel.name }))}
    />
  );
}
