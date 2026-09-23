"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ChannelEventItem } from "@/app/(app)/tracking/[channelId]/channel-event-item";
import { VideosTable } from "@/app/(app)/tracking/[channelId]/videos-table";
import { ViewTrendChart } from "@/app/(app)/tracking/[channelId]/view-trend-chart";
import { OutlierCard } from "@/components/features/outliers/outlier-card";
import type { TrackedEvent } from "@/lib/services/tracking";
import type { VideoSummary } from "@/lib/services/channels";
import type { OutlierItem } from "@/lib/services/outliers";

export interface ChannelMetrics {
  avgViewsLast30Days: number;
  avgViewsLifetime: number;
  uploadFrequencyPerWeek: number;
  viewTrend: number[];
}

export interface ChannelTabsProps {
  events: TrackedEvent[];
  videos: VideoSummary[];
  metrics: ChannelMetrics;
  outliers: OutlierItem[];
}

function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

// UI-UX-Flow.md §6.2. All three tabs' data is fetched once, server-side, in
// page.tsx and handed down here -- switching tabs is a pure client-side
// render, no extra round trip per tab.
function ChannelTabs({ events, videos, metrics, outliers }: ChannelTabsProps) {
  return (
    <Tabs defaultValue="activity">
      <TabsList>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="videos">Videos</TabsTrigger>
        <TabsTrigger value="outliers">Outliers</TabsTrigger>
        <TabsTrigger value="metrics">Metrics</TabsTrigger>
      </TabsList>

      <TabsContent value="activity" className="flex flex-col gap-3 pt-4">
        {events.length === 0 ? (
          <EmptyState message="No activity detected for this channel yet." />
        ) : (
          events.map((event) => <ChannelEventItem key={event.id} event={event} />)
        )}
      </TabsContent>

      <TabsContent value="videos" className="pt-4">
        <VideosTable videos={videos} />
      </TabsContent>

      <TabsContent value="outliers" className="flex flex-col gap-3 pt-4">
        {outliers.length === 0 ? (
          <EmptyState message="No outliers detected for this channel yet." />
        ) : (
          outliers.map((outlier) => (
            <OutlierCard key={outlier.id} outlier={outlier} showChannel={false} />
          ))
        )}
      </TabsContent>

      <TabsContent value="metrics" className="flex flex-col gap-4 pt-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Card padding="md">
            <p className="text-caption text-text-tertiary">Avg views (30d)</p>
            <p className="text-h3 text-text-primary">{formatCount(metrics.avgViewsLast30Days)}</p>
          </Card>
          <Card padding="md">
            <p className="text-caption text-text-tertiary">Avg views (lifetime)</p>
            <p className="text-h3 text-text-primary">{formatCount(metrics.avgViewsLifetime)}</p>
          </Card>
          <Card padding="md">
            <p className="text-caption text-text-tertiary">Upload frequency</p>
            <p className="text-h3 text-text-primary">
              {metrics.uploadFrequencyPerWeek.toFixed(1)}/wk
            </p>
          </Card>
        </div>

        {/* TODO: historical charts need snapshot table (not spec'd yet) --
            Flag 8. Only current aggregates + this recent-videos sparkline
            are available; a real subs/views-over-time chart needs a
            periodic snapshot table this codebase doesn't have yet. */}
        {metrics.viewTrend.length > 1 ? (
          <Card padding="md">
            <p className="mb-2 text-caption text-text-tertiary">Recent video views</p>
            <ViewTrendChart viewTrend={metrics.viewTrend} />
          </Card>
        ) : null}
      </TabsContent>
    </Tabs>
  );
}

export { ChannelTabs };
