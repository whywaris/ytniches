import { afterEach, describe, expect, it, vi } from "vitest";

import { readLocalStorage, writeLocalStorage } from "@/lib/local-storage";

afterEach(() => {
  window.localStorage.clear();
});

describe("readLocalStorage", () => {
  it("returns the fallback when nothing is stored", () => {
    expect(readLocalStorage("missing-key", "default", (raw) => raw)).toBe("default");
  });

  it("parses the stored value when present", () => {
    window.localStorage.setItem("view-pref", "list");
    expect(readLocalStorage("view-pref", "grid", (raw) => raw)).toBe("list");
  });

  it("returns the fallback if localStorage throws (private browsing)", () => {
    const spy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(readLocalStorage("any-key", "fallback", (raw) => raw)).toBe("fallback");
    spy.mockRestore();
  });
});

describe("writeLocalStorage", () => {
  it("persists the value", () => {
    writeLocalStorage("view-pref", "comparison");
    expect(window.localStorage.getItem("view-pref")).toBe("comparison");
  });

  it("does not throw if localStorage throws (private browsing)", () => {
    const spy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => writeLocalStorage("any-key", "value")).not.toThrow();
    spy.mockRestore();
  });
});
