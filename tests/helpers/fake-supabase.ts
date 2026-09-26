import { vi } from "vitest";

// A chainable, thenable Supabase query double. Every builder method
// (select/eq/in/order/range/...) returns the same builder and is recorded,
// so tests can assert on filters; awaiting it (or .single/.maybeSingle)
// resolves to the queued result. Tables get results in FIFO order.

export interface FakeResult {
  data?: unknown;
  error?: { message: string } | null;
  count?: number | null;
}

export interface RecordedQuery {
  table: string;
  calls: { method: string; args: unknown[] }[];
}

export function createFakeSupabase() {
  const queues = new Map<string, FakeResult[]>();
  const queries: RecordedQuery[] = [];
  const rpcResults = new Map<string, FakeResult[]>();
  const rpcCalls: { fn: string; args: unknown }[] = [];

  function builderFor(table: string) {
    const record: RecordedQuery = { table, calls: [] };
    queries.push(record);
    const next = (): FakeResult => {
      const queue = queues.get(table) ?? [];
      return queue.shift() ?? { data: [], error: null, count: 0 };
    };
    const settle = () => {
      const result = next();
      return {
        data: result.data ?? null,
        error: result.error ?? null,
        count: result.count ?? null,
      };
    };
    const proxy: object = new Proxy(
      {},
      {
        get(_target, prop: string) {
          if (prop === "then") {
            return (resolve: (value: unknown) => void, reject: (e: unknown) => void) =>
              Promise.resolve(settle()).then(resolve, reject);
          }
          return (...args: unknown[]) => {
            record.calls.push({ method: prop, args });
            return proxy;
          };
        },
      },
    );
    return proxy;
  }

  const client = {
    from: vi.fn((table: string) => builderFor(table)),
    rpc: vi.fn(async (fn: string, args: unknown) => {
      rpcCalls.push({ fn, args });
      const result = rpcResults.get(fn)?.shift() ?? { data: [], error: null };
      return { data: result.data ?? null, error: result.error ?? null };
    }),
  };

  return {
    client,
    queries,
    rpcCalls,
    /** Queue results for successive queries against `table`. */
    on(table: string, ...results: FakeResult[]) {
      queues.set(table, [...(queues.get(table) ?? []), ...results]);
    },
    onRpc(fn: string, ...results: FakeResult[]) {
      rpcResults.set(fn, [...(rpcResults.get(fn) ?? []), ...results]);
    },
    /** All recorded queries against `table`. */
    queriesFor(table: string) {
      return queries.filter((query) => query.table === table);
    },
    reset() {
      queues.clear();
      rpcResults.clear();
      queries.length = 0;
      rpcCalls.length = 0;
    },
  };
}

export function callsOf(query: RecordedQuery | undefined, method: string): unknown[][] {
  return (query?.calls ?? []).filter((call) => call.method === method).map((call) => call.args);
}
