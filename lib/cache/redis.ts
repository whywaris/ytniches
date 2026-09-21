import { Redis } from "@upstash/redis";

// TRD.md §1.4: shared Redis wrapper. lib/youtube/ (and future rate-limit /
// session-extras code, TRD.md §5.2) import the client from here rather than
// each instantiating their own — one connection config, one place to swap
// if the provider ever changes.
let client: Redis | undefined;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return client;
}
