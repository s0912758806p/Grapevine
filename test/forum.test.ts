import { describe, expect, it } from "vitest";
import { BOARDS, getBoard } from "@/lib/boards";
import { FIXTURE_NOW, THREADS, fixtureAdapter } from "@/lib/forum/fixtures";
import { applyQuery, parseSort } from "@/lib/forum/query";

describe("boards", () => {
  it("have unique slugs and Discussion categories", () => {
    expect(new Set(BOARDS.map((b) => b.slug)).size).toBe(BOARDS.length);
    expect(new Set(BOARDS.map((b) => b.discussionCategory)).size).toBe(BOARDS.length);
  });
});

describe("fixtures", () => {
  it("only reference existing boards and use unique numbers", () => {
    for (const t of THREADS) expect(getBoard(t.board), `thread ${t.number}`).toBeDefined();
    expect(new Set(THREADS.map((t) => t.number)).size).toBe(THREADS.length);
  });

  it("keep board-specific fields on the right boards", () => {
    for (const t of THREADS) {
      if (t.job) expect(t.board).toBe("jobs");
      if (t.meetup) expect(t.board).toBe("meetups");
      if (t.credibility || t.anonymous) expect(t.board).toBe("rumors");
    }
  });

  it("resolve thread detail with participants and related threads", async () => {
    const detail = await fixtureAdapter.getThread(101);
    expect(detail?.answer?.isAnswer).toBe(true);
    expect(detail?.participants.map((p) => p.login)).toContain("ruo_yun");
    expect(detail?.related.every((r) => r.number !== 101)).toBe(true);
    expect(await fixtureAdapter.getThread(999_999)).toBeNull();
  });
});

describe("applyQuery", () => {
  it("parses unknown sort values as hot", () => {
    expect(parseSort("new")).toBe("new");
    expect(parseSort(["open"])).toBe("open");
    expect(parseSort("bogus")).toBe("hot");
    expect(parseSort(undefined)).toBe("hot");
  });

  it("sorts newest first", () => {
    const list = applyQuery(THREADS, { sort: "new" }, FIXTURE_NOW);
    for (let i = 1; i < list.length; i++) {
      expect(Date.parse(list[i - 1].createdAt)).toBeGreaterThanOrEqual(Date.parse(list[i].createdAt));
    }
  });

  it("filters featured, unanswered, board, tag, author and text", () => {
    expect(applyQuery(THREADS, { sort: "top" }, FIXTURE_NOW).every((t) => t.featured)).toBe(true);
    expect(applyQuery(THREADS, { sort: "open" }, FIXTURE_NOW).every((t) => t.replyCount === 0)).toBe(true);
    expect(applyQuery(THREADS, { board: "jobs" }, FIXTURE_NOW).every((t) => t.board === "jobs")).toBe(true);
    expect(applyQuery(THREADS, { tag: "react" }, FIXTURE_NOW).every((t) => t.tags.includes("react"))).toBe(true);
    expect(applyQuery(THREADS, { author: "ruo_yun" }, FIXTURE_NOW).every((t) => t.author.login === "ruo_yun")).toBe(true);
    expect(applyQuery(THREADS, { q: "SUSPENSE" }, FIXTURE_NOW).map((t) => t.number)).toContain(101);
  });

  it("never attributes anonymous threads to an author", () => {
    expect(applyQuery(THREADS, { author: "anonymous" }, FIXTURE_NOW)).toHaveLength(0);
  });

  it("ranks a fresh, busy thread above an old one with the same engagement", () => {
    const base = THREADS.find((t) => t.number === 101)!;
    const fresh = { ...base, number: 1001, createdAt: new Date(FIXTURE_NOW - 3_600_000).toISOString() };
    const old = { ...base, number: 1002, createdAt: new Date(FIXTURE_NOW - 30 * 86_400_000).toISOString() };
    expect(applyQuery([old, fresh], { sort: "hot" }, FIXTURE_NOW).map((t) => t.number)).toEqual([1001, 1002]);
  });
});
