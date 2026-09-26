"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Niche-Discovery-Engine.md §9.1. The Tabs primitive, driven by `?tab=`:
// each tab's content is server-rendered for the URL, so switching tabs is a
// navigation, and only the active tab's content exists.

export const FEED_TAB_LABELS = {
  niches: "Niches",
  channels: "Channels",
  outliers: "Outliers",
  search: "Search",
} as const;
export type FeedTabValue = keyof typeof FEED_TAB_LABELS;

export interface FeedTabsProps {
  active: FeedTabValue;
  /** href per tab (built server-side so filters can be preserved or reset). */
  hrefs: Record<FeedTabValue, string>;
  children: React.ReactNode;
}

function FeedTabs({ active, hrefs, children }: FeedTabsProps) {
  const router = useRouter();
  return (
    <Tabs
      value={active}
      onValueChange={(value) => router.push(hrefs[value as FeedTabValue])}
      activationMode="manual"
    >
      <TabsList aria-label="Niche Finder views">
        {(Object.keys(FEED_TAB_LABELS) as FeedTabValue[]).map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {FEED_TAB_LABELS[tab]}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={active}>{children}</TabsContent>
    </Tabs>
  );
}

export { FeedTabs };
