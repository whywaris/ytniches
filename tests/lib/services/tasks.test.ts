import { beforeEach, describe, expect, it, vi } from "vitest";

function makeBuilder(getResult: () => { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {
    select: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    in: vi.fn(() => builder),
    is: vi.fn(() => builder),
    order: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(getResult())),
    single: vi.fn(() => Promise.resolve(getResult())),
    then: (resolve: (value: { data: unknown; error: unknown }) => void) => resolve(getResult()),
  };
  return builder;
}

// workspace_members gets queried up to twice per call (requireContributor,
// then isWorkspaceMember for an assignee) -- a queue lets a test give each
// call its own answer instead of one shared value serving both.
let membersQueue: { data: unknown; error: unknown }[] = [];
let tasksResult: { data: unknown; error: unknown } = { data: null, error: null };
let profilesResult: { data: unknown; error: unknown } = { data: [], error: null };

function queueMembers(...results: { data: unknown; error: unknown }[]) {
  membersQueue = results;
}

const sessionFrom = vi.fn((table: string) => {
  if (table === "workspace_members") {
    return makeBuilder(() => membersQueue.shift() ?? { data: null, error: null });
  }
  if (table === "tasks") return makeBuilder(() => tasksResult);
  if (table === "profiles") return makeBuilder(() => profilesResult);
  throw new Error(`unexpected table ${table}`);
});

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: sessionFrom }),
}));

const { assignTask, createTask, deleteTask, listTasks, updateTask } =
  await import("@/lib/services/tasks");

const ctx = { userId: "user-1", workspaceId: null, tier: null };

beforeEach(() => {
  membersQueue = [];
  tasksResult = { data: null, error: null };
  profilesResult = { data: [], error: null };
});

describe("createTask", () => {
  it("rejects a viewer", async () => {
    queueMembers({ data: { role: "viewer" }, error: null });
    const result = await createTask(ctx, "ws-1", { title: "Do the thing" });
    expect(result).toEqual({ ok: false, error: { type: "not_contributor" } });
  });

  it("rejects an assignee who isn't a workspace member", async () => {
    queueMembers(
      { data: { role: "admin" }, error: null }, // requireContributor
      { data: null, error: null }, // isWorkspaceMember(assignee)
    );
    const result = await createTask(ctx, "ws-1", { title: "Do it", assigneeId: "user-2" });
    expect(result).toEqual({ ok: false, error: { type: "assignee_not_member" } });
  });

  it("creates a task as an editor", async () => {
    queueMembers({ data: { role: "editor" }, error: null });
    tasksResult = {
      data: {
        id: "t1",
        workspace_id: "ws-1",
        title: "Do it",
        description: null,
        assignee_id: null,
        due_date: null,
        status: "open",
        linked_type: null,
        linked_id: null,
        created_by: "user-1",
        created_at: "2026-01-01T00:00:00Z",
      },
      error: null,
    };

    const result = await createTask(ctx, "ws-1", { title: "Do it" });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Do it");
      expect(result.value.status).toBe("open");
    }
  });
});

describe("listTasks", () => {
  it("maps rows and attaches assignee names", async () => {
    tasksResult = {
      data: [
        {
          id: "t1",
          workspace_id: "ws-1",
          title: "Do it",
          description: null,
          assignee_id: "user-2",
          due_date: null,
          status: "open",
          linked_type: null,
          linked_id: null,
          created_by: "user-1",
          created_at: "2026-01-01T00:00:00Z",
        },
      ],
      error: null,
    };
    profilesResult = { data: [{ id: "user-2", name: "Bob" }], error: null };

    const result = await listTasks(ctx, "ws-1", { view: "all" });

    expect(result).toEqual([
      {
        id: "t1",
        workspaceId: "ws-1",
        title: "Do it",
        description: null,
        assigneeId: "user-2",
        assigneeName: "Bob",
        dueDate: null,
        status: "open",
        linkedType: null,
        linkedId: null,
        createdBy: "user-1",
        createdAt: "2026-01-01T00:00:00Z",
      },
    ]);
  });
});

describe("updateTask", () => {
  it("returns not_found for a task outside this workspace/deleted", async () => {
    tasksResult = { data: null, error: null };
    const result = await updateTask(ctx, "missing-task", { status: "done" });
    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });

  it("rejects a viewer", async () => {
    tasksResult = { data: { workspace_id: "ws-1" }, error: null };
    queueMembers({ data: { role: "viewer" }, error: null });
    const result = await updateTask(ctx, "t1", { status: "done" });
    expect(result).toEqual({ ok: false, error: { type: "not_contributor" } });
  });

  it("updates status as an admin", async () => {
    tasksResult = { data: { workspace_id: "ws-1" }, error: null };
    queueMembers({ data: { role: "admin" }, error: null });
    const result = await updateTask(ctx, "t1", { status: "done" });
    expect(result).toEqual({ ok: true, value: undefined });
  });
});

describe("assignTask", () => {
  it("delegates to updateTask", async () => {
    tasksResult = { data: { workspace_id: "ws-1" }, error: null };
    queueMembers({ data: { role: "admin" }, error: null }, { data: { id: "m1" }, error: null });
    const result = await assignTask(ctx, "t1", "user-2");
    expect(result.ok).toBe(true);
  });
});

describe("deleteTask", () => {
  it("returns not_found for a missing task", async () => {
    tasksResult = { data: null, error: null };
    const result = await deleteTask(ctx, "missing-task");
    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
  });

  it("soft-deletes as a contributor", async () => {
    tasksResult = { data: { workspace_id: "ws-1" }, error: null };
    queueMembers({ data: { role: "editor" }, error: null });
    const result = await deleteTask(ctx, "t1");
    expect(result).toEqual({ ok: true, value: undefined });
  });
});
