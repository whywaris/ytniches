import { beforeEach, describe, expect, it, vi } from "vitest";

const generateThumbnailIdeaOutput = vi.fn();
vi.mock("@/lib/ai", () => ({
  generateThumbnailIdeaOutput: (...args: unknown[]) => generateThumbnailIdeaOutput(...args),
}));

const consume = vi.fn();
const refund = vi.fn();
vi.mock("@/lib/credits", () => ({
  consume: (...args: unknown[]) => consume(...args),
  refund: (...args: unknown[]) => refund(...args),
}));

const sessionFrom = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ from: sessionFrom }),
}));

const { generateThumbnailIdeas, regenerateThumbnailIdeas } =
  await import("@/lib/services/thumbnail-ideas");

const ctx = { userId: "user-1" };

// Same chainable/thenable double as tests/lib/services/prompts.test.ts.
function makeQueryBuilder(result: { data: unknown; error: unknown }) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    single: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: typeof result) => void) => resolve(result),
  };
  return builder;
}

const VIDEO_ROW = {
  id: "vid-1",
  title: "8 Hours of Deep Sleep Music",
  description: "Relaxing sounds",
  tags: ["sleep", "music"],
  thumbnail_url: "https://example.com/thumb.jpg",
};

const IDEAS_OUTPUT = { ideas: ["Idea A", "Idea B", "Idea C"] };

function thumbnailIdeaRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "row-1",
    user_id: ctx.userId,
    source_video_id: "vid-1",
    kind: "thumbnail_ideas",
    tone: "neutral",
    target_audience: null,
    output: IDEAS_OUTPUT,
    regeneration_of: null,
    feedback_tags: [],
    deleted_at: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateThumbnailIdeas", () => {
  it("consumes credits, generates, and inserts a kind='thumbnail_ideas' row on the happy path", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null })); // getVideoRow
    consume.mockResolvedValueOnce({ ok: true, value: undefined });
    generateThumbnailIdeaOutput.mockResolvedValueOnce({ ok: true, value: IDEAS_OUTPUT });
    const insertTable = makeQueryBuilder({ data: thumbnailIdeaRow(), error: null });
    sessionFrom.mockReturnValueOnce(insertTable);

    const result = await generateThumbnailIdeas(ctx, "vid-1", "key-1");

    expect(consume).toHaveBeenCalledWith(ctx, 5, "Thumbnail idea generation", "key-1");
    expect(generateThumbnailIdeaOutput).toHaveBeenCalledWith({
      videoTitle: "8 Hours of Deep Sleep Music",
      videoDescription: "Relaxing sounds",
      videoTags: ["sleep", "music"],
    });
    expect(insertTable.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "thumbnail_ideas",
        tone: "neutral",
        source_video_id: "vid-1",
        output: IDEAS_OUTPUT,
        regeneration_of: null,
      }),
    );
    expect(result).toEqual({
      ok: true,
      value: {
        id: "row-1",
        sourceVideo: {
          id: "vid-1",
          title: "8 Hours of Deep Sleep Music",
          thumbnailUrl: "https://example.com/thumb.jpg",
        },
        ideas: ["Idea A", "Idea B", "Idea C"],
        regenerationOf: null,
        createdAt: "2026-01-01T00:00:00Z",
      },
    });
  });

  it("returns not_found without consuming credits when the video doesn't exist", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));

    const result = await generateThumbnailIdeas(ctx, "missing-vid", "key-1");

    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
    expect(consume).not.toHaveBeenCalled();
  });

  it("returns the credits error without calling the AI provider", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null }));
    consume.mockResolvedValueOnce({
      ok: false,
      error: { type: "insufficient_credits", balance: 2, required: 5 },
    });

    const result = await generateThumbnailIdeas(ctx, "vid-1", "key-1");

    expect(result).toEqual({
      ok: false,
      error: { type: "insufficient_credits", balance: 2, required: 5 },
    });
    expect(generateThumbnailIdeaOutput).not.toHaveBeenCalled();
  });

  it("refunds and returns generation_failed when the AI call fails", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null }));
    consume.mockResolvedValueOnce({ ok: true, value: undefined });
    generateThumbnailIdeaOutput.mockResolvedValueOnce({
      ok: false,
      error: { type: "rate_limited" },
    });

    const result = await generateThumbnailIdeas(ctx, "vid-1", "key-1");

    expect(refund).toHaveBeenCalledWith(ctx, 5, "Thumbnail idea generation failed", "key-1");
    expect(result).toEqual({
      ok: false,
      error: {
        type: "generation_failed",
        message: "The AI provider is rate-limiting requests right now.",
      },
    });
  });
});

describe("regenerateThumbnailIdeas", () => {
  it("chains regeneration_of to the original and reuses its source video", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: thumbnailIdeaRow({ id: "original-1" }), error: null }),
    ); // getOwnThumbnailIdeaRow
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null })); // getVideoRow
    consume.mockResolvedValueOnce({ ok: true, value: undefined });
    generateThumbnailIdeaOutput.mockResolvedValueOnce({
      ok: true,
      value: { ideas: ["New idea A", "New idea B", "New idea C"] },
    });
    const insertTable = makeQueryBuilder({
      data: thumbnailIdeaRow({ id: "row-2", regeneration_of: "original-1" }),
      error: null,
    });
    sessionFrom.mockReturnValueOnce(insertTable);

    const result = await regenerateThumbnailIdeas(ctx, "original-1", "key-2");

    expect(consume).toHaveBeenCalledWith(ctx, 5, "Thumbnail idea regeneration", "key-2");
    expect(insertTable.insert).toHaveBeenCalledWith(
      expect.objectContaining({ regeneration_of: "original-1", source_video_id: "vid-1" }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.regenerationOf).toBe("original-1");
    }
  });

  it("returns not_found when the original thumbnail idea set doesn't belong to this user", async () => {
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: null, error: null }));

    const result = await regenerateThumbnailIdeas(ctx, "not-mine", "key-2");

    expect(result).toEqual({ ok: false, error: { type: "not_found" } });
    expect(consume).not.toHaveBeenCalled();
  });

  it("refunds on a failed regeneration", async () => {
    sessionFrom.mockReturnValueOnce(
      makeQueryBuilder({ data: thumbnailIdeaRow({ id: "original-1" }), error: null }),
    );
    sessionFrom.mockReturnValueOnce(makeQueryBuilder({ data: VIDEO_ROW, error: null }));
    consume.mockResolvedValueOnce({ ok: true, value: undefined });
    generateThumbnailIdeaOutput.mockResolvedValueOnce({
      ok: false,
      error: { type: "overloaded" },
    });

    const result = await regenerateThumbnailIdeas(ctx, "original-1", "key-2");

    expect(refund).toHaveBeenCalledWith(ctx, 5, "Thumbnail idea regeneration failed", "key-2");
    expect(result).toEqual({
      ok: false,
      error: {
        type: "generation_failed",
        message: "The AI provider is temporarily overloaded.",
      },
    });
  });
});
