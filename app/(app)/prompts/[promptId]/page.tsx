import { cache } from "react";

import { notFound } from "next/navigation";

import { getPromptAction } from "@/app/(app)/prompts/actions";
import { PromptDetailClient } from "@/app/(app)/prompts/[promptId]/prompt-detail-client";

import type { Metadata } from "next";

// React's request-scoped cache: generateMetadata and the page component
// both need this prompt, same reasoning as tracking/[channelId]/page.tsx.
const getCachedPrompt = cache((promptId: string) => getPromptAction(promptId));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ promptId: string }>;
}): Promise<Metadata> {
  const { promptId } = await params;
  const prompt = await getCachedPrompt(promptId);
  return {
    title: prompt ? `${prompt.sourceVideo.title} — Prompts — YTNiches` : "Prompts — YTNiches",
  };
}

// UI-UX-Flow.md §7.4.
export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ promptId: string }>;
}) {
  const { promptId } = await params;
  const prompt = await getCachedPrompt(promptId);
  if (!prompt) {
    notFound();
  }

  return <PromptDetailClient prompt={prompt} />;
}
