// Inngest event names for the Discovery Engine (workers/discovery.ts). In
// lib/ rather than workers/ so the admin service can trigger a job without
// importing the worker module itself.

import { YOUTUBE_RETENTION_EVENT } from "@/lib/youtube/retention";

export const ENRICH_EVENT = "discovery/enrich.requested";

// TRD.md §4.4: manual triggers from the admin panel, one per job.
export const MANUAL_EVENTS = {
  discovery: "discovery/run.requested",
  enrichment: "discovery/enrichment-cron.requested",
  classify: "discovery/classify.requested",
  snapshot: "discovery/snapshot.requested",
  // D-073: the purge is main's youtube-retention job (D-067b), not ours.
  purge: YOUTUBE_RETENTION_EVENT,
} as const;
export type ManualJob = keyof typeof MANUAL_EVENTS;
export const MANUAL_JOBS = Object.keys(MANUAL_EVENTS) as ManualJob[];
