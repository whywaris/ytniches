import { beforeEach, describe, expect, it, vi } from "vitest";

const parseMock = vi.fn();

vi.mock("@anthropic-ai/sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@anthropic-ai/sdk")>();
  class MockAnthropic {
    messages = { parse: parseMock };
  }
  // The real error classes are static properties on the default export
  // (Anthropic.RateLimitError, etc.) -- client.ts checks `instanceof
  // Anthropic.RateLimitError`, so the mock needs the same real classes
  // attached, not a bare stand-in.
  Object.assign(MockAnthropic, {
    APIError: actual.default.APIError,
    APIConnectionError: actual.default.APIConnectionError,
    RateLimitError: actual.default.RateLimitError,
    BadRequestError: actual.default.BadRequestError,
  });
  return { ...actual, default: MockAnthropic };
});

const Anthropic = (await import("@anthropic-ai/sdk")).default;
const { generateStructuredOutput } = await import("@/lib/ai/client");

const VALID_OUTPUT = {
  title_variants: ["A", "B", "C", "D", "E"],
  thumbnail_concepts: ["X", "Y", "Z"],
  hook_variants: ["H1", "H2", "H3"],
  script_outline: { intro: "Intro", body_sections: ["Body 1"], outro: "Outro" },
  description_template: "Description",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateStructuredOutput", () => {
  it("returns the parsed output on success", async () => {
    parseMock.mockResolvedValueOnce({ parsed_output: VALID_OUTPUT });

    const result = await generateStructuredOutput("system prompt", "user prompt");

    expect(result).toEqual({ ok: true, value: VALID_OUTPUT });
    expect(parseMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-sonnet-5",
        system: "system prompt",
        messages: [{ role: "user", content: "user prompt" }],
      }),
    );
  });

  it("never sends temperature/top_p/top_k -- claude-sonnet-5 rejects them with a 400", async () => {
    parseMock.mockResolvedValueOnce({ parsed_output: VALID_OUTPUT });

    await generateStructuredOutput("system prompt", "user prompt");

    const callArgs = parseMock.mock.calls[0][0] as Record<string, unknown>;
    expect(callArgs).not.toHaveProperty("temperature");
    expect(callArgs).not.toHaveProperty("top_p");
    expect(callArgs).not.toHaveProperty("top_k");
  });

  it("returns invalid_response when parsed_output is null", async () => {
    parseMock.mockResolvedValueOnce({ parsed_output: null });

    const result = await generateStructuredOutput("system", "user");

    expect(result).toEqual({
      ok: false,
      error: { type: "invalid_response", message: expect.any(String) },
    });
  });

  it("maps a RateLimitError to rate_limited", async () => {
    parseMock.mockRejectedValueOnce(
      new Anthropic.RateLimitError(429, undefined, "slow down", new Headers()),
    );

    const result = await generateStructuredOutput("system", "user");

    expect(result).toEqual({ ok: false, error: { type: "rate_limited" } });
  });

  it("maps a 529 APIError to overloaded", async () => {
    parseMock.mockRejectedValueOnce(
      new Anthropic.APIError(529, undefined, "overloaded", undefined),
    );

    const result = await generateStructuredOutput("system", "user");

    expect(result).toEqual({ ok: false, error: { type: "overloaded" } });
  });

  it("maps a BadRequestError to invalid_request", async () => {
    parseMock.mockRejectedValueOnce(
      new Anthropic.BadRequestError(400, undefined, "bad schema", new Headers()),
    );

    const result = await generateStructuredOutput("system", "user");

    expect(result).toEqual({
      ok: false,
      error: { type: "invalid_request", message: "400 bad schema" },
    });
  });

  it("maps an APIConnectionError to network_error", async () => {
    parseMock.mockRejectedValueOnce(
      new Anthropic.APIConnectionError({ message: "connection refused" }),
    );

    const result = await generateStructuredOutput("system", "user");

    expect(result).toEqual({
      ok: false,
      error: { type: "network_error", message: "connection refused" },
    });
  });

  it("maps an arbitrary 500 APIError to a generic api_error", async () => {
    parseMock.mockRejectedValueOnce(
      new Anthropic.APIError(500, undefined, "server exploded", undefined),
    );

    const result = await generateStructuredOutput("system", "user");

    expect(result).toEqual({
      ok: false,
      error: { type: "api_error", status: 500, message: "500 server exploded" },
    });
  });

  it("maps a non-SDK thrown error to network_error without crashing", async () => {
    parseMock.mockRejectedValueOnce(new Error("totally unexpected"));

    const result = await generateStructuredOutput("system", "user");

    expect(result).toEqual({
      ok: false,
      error: { type: "network_error", message: "totally unexpected" },
    });
  });
});
