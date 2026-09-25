import { describe, expect, it } from "vitest";

import {
  chapterProblems,
  estimateRevenue,
  formatChapters,
  isValidRpm,
  normalizeYoutubeLink,
  parseChapterLines,
  thumbnailOptions,
  viewsToGoal,
  watchTime,
} from "@/lib/tools/calculators";

describe("thumbnailOptions", () => {
  it("builds YouTube's fixed thumbnail URLs, largest first", () => {
    const options = thumbnailOptions("4oxA9o_OmWo");
    expect(options.map((o) => o.url)).toEqual([
      "https://i.ytimg.com/vi/4oxA9o_OmWo/maxresdefault.jpg",
      "https://i.ytimg.com/vi/4oxA9o_OmWo/sddefault.jpg",
      "https://i.ytimg.com/vi/4oxA9o_OmWo/hqdefault.jpg",
      "https://i.ytimg.com/vi/4oxA9o_OmWo/mqdefault.jpg",
      "https://i.ytimg.com/vi/4oxA9o_OmWo/default.jpg",
    ]);
    expect(options[0]).toMatchObject({ width: 1280, height: 720 });
  });
});

describe("watch time", () => {
  it("turns views and average view duration into hours toward 4,000", () => {
    expect(watchTime(50_000, 180)).toEqual({
      hours: 2500,
      percentOfGoal: 62.5,
      hoursRemaining: 1500,
    });
    expect(viewsToGoal(2500, 180)).toBe(30_000);
  });

  it("caps at the goal once it's reached", () => {
    expect(watchTime(200_000, 180)).toMatchObject({ percentOfGoal: 100, hoursRemaining: 0 });
    expect(viewsToGoal(10_000, 180)).toBe(0);
  });
});

describe("revenue", () => {
  it("is views / 1000 × the creator's own RPM", () => {
    expect(estimateRevenue(50_000, 4)).toBe(200);
  });

  it("only accepts RPMs in a sane range", () => {
    expect(isValidRpm(0.01)).toBe(true);
    expect(isValidRpm(100)).toBe(true);
    expect(isValidRpm(0)).toBe(false);
    expect(isValidRpm(500)).toBe(false);
    expect(isValidRpm(Number.NaN)).toBe(false);
  });
});

describe("chapters", () => {
  it("reads time-first and time-last lines, sorted, and flags unreadable ones", () => {
    const { chapters, unreadable } = parseChapterLines(
      "1:30 The setup\nWrap up - 1:02:03\n0:00 Intro\nnot a chapter",
    );
    expect(chapters).toEqual([
      { start: 0, title: "Intro" },
      { start: 90, title: "The setup" },
      { start: 3723, title: "Wrap up" },
    ]);
    expect(unreadable).toEqual(["not a chapter"]);
  });

  it("formats m:ss under an hour and h:mm:ss after, so the first stays 0:00", () => {
    expect(
      formatChapters([
        { start: 0, title: "Intro" },
        { start: 90, title: "Setup" },
        { start: 3723, title: "Wrap up" },
      ]),
    ).toBe("0:00 Intro\n1:30 Setup\n1:02:03 Wrap up");
  });

  it("checks YouTube's rules: 0:00 start, 3+ chapters, 10s each", () => {
    expect(chapterProblems([{ start: 5, title: "A" }])).toEqual([
      "YouTube needs at least 3 chapters.",
      "The first chapter must start at 0:00.",
    ]);
    expect(
      chapterProblems([
        { start: 0, title: "A" },
        { start: 5, title: "B" },
        { start: 60, title: "C" },
      ]),
    ).toEqual(['"A" is shorter than 10 seconds. Each chapter needs at least 10.']);
    expect(
      chapterProblems([
        { start: 0, title: "A" },
        { start: 10, title: "B" },
        { start: 60, title: "C" },
      ]),
    ).toEqual([]);
  });
});

describe("normalizeYoutubeLink", () => {
  it("accepts YouTube links only, forcing https", () => {
    expect(normalizeYoutubeLink("youtube.com/@GoogleDevelopers")).toBe(
      "https://youtube.com/@GoogleDevelopers",
    );
    expect(normalizeYoutubeLink("http://youtu.be/4oxA9o_OmWo")).toBe(
      "https://youtu.be/4oxA9o_OmWo",
    );
    expect(normalizeYoutubeLink("https://m.youtube.com/watch?v=x")).toBe(
      "https://m.youtube.com/watch?v=x",
    );
    expect(normalizeYoutubeLink("https://example.com/")).toBeNull();
    expect(normalizeYoutubeLink("https://youtube.com.evil.com/")).toBeNull();
    expect(normalizeYoutubeLink("")).toBeNull();
  });
});
