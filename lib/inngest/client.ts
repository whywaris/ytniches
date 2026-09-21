import { Inngest } from "inngest";

// TRD.md §4.1: Inngest as the job runner. channelId, not userId, is the
// event's identity — channel-sync operates on shared channel/video data
// (Backend-Schema.md §4.2: tracked_events are per-channel, not per-user),
// so the whole sync happens once per channel regardless of how many users
// track it, not once per user.
//
// Inngest v4 dropped the v3 EventSchemas().fromRecord<T>() client-level
// typing mechanism entirely (no replacement found in this version's
// types). event.data is validated with Zod inside each function handler
// instead — CLAUDE.md §2.2's "Zod at every trust boundary" already covers
// an inbound event payload, so this isn't a workaround, it's the same
// pattern used everywhere else in this codebase.
export const inngest = new Inngest({ id: "ytniches" });
