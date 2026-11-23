import { describe, expect, it } from "vitest";
import { requireBoard } from "@/lib/boards";
import { safeReturnTo } from "@/lib/github/return-to";
import { toTokenSet } from "@/lib/github/oauth";
import { boardForCategory, mapDiscussion } from "@/lib/forum/github";
import { excerptOf, normalizeTags, parseMeta, withMeta } from "@/lib/forum/meta";
import { jobFacts, mapIssue, type RawIssue } from "@/lib/forum/mirror";

describe("thread metadata comment", () => {
  it("round-trips tags and meetup details and hides them from the body", () => {
    const body = withMeta("Hello **world**", { tags: ["react", "vite"], meetup: { city: "台北", when: "12/6 14:00", venue: "某咖啡廳" } });
    expect(body).toContain("<!-- grapevine ");
    const parsed = parseMeta(body);
    expect(parsed.body).toBe("Hello **world**");
    expect(parsed.meta).toEqual({ tags: ["react", "vite"], meetup: { city: "台北", when: "12/6 14:00", venue: "某咖啡廳" } });
  });

  it("cannot be broken out of with -->", () => {
    const body = withMeta("x", { meetup: { city: "台北", when: "-->", venue: "a--b" } });
    expect(body.match(/-->/g)).toHaveLength(1);
    expect(parseMeta(body).meta.meetup?.venue).toBe("a--b");
  });

  it("leaves bodies without metadata alone and ignores malformed JSON", () => {
    expect(parseMeta("plain")).toEqual({ body: "plain", meta: {} });
    expect(parseMeta("text\n<!-- grapevine {oops} -->").meta).toEqual({});
    expect(withMeta("text  ", {})).toBe("text");
  });

  it("normalizes tags", () => {
    expect(normalizeTags("React, #vite  react，面試 bad<tag>")).toEqual(["react", "vite", "面試"]);
  });

  it("builds plain-text excerpts", () => {
    expect(excerptOf("## Title\n\nSee [docs](https://x.y) and `code`.\n```js\nsecret()\n```")).toBe("Title See docs and code .");
    expect(excerptOf("a".repeat(200), 10)).toHaveLength(10);
  });
});

const discussion = {
  id: "D_1",
  number: 7,
  title: "標題",
  body: "內文\n\n<!-- grapevine {\"tags\":[\"react\"]} -->",
  url: "https://github.com/o/r/discussions/7",
  createdAt: "2026-11-20T00:00:00Z",
  updatedAt: "2026-11-21T00:00:00Z",
  upvoteCount: 6,
  isAnswered: true,
  category: { name: "Q&A" },
  author: { login: "alice", avatarUrl: "https://avatars/a", name: "Alice" },
  commentCount: { totalCount: 3 },
  reactionGroups: [
    { content: "HOORAY", reactors: { totalCount: 2 } },
    { content: "HEART", reactors: { totalCount: 1 } },
    { content: "THUMBS_UP", reactors: { totalCount: 9 } },
    { content: "THUMBS_DOWN", reactors: { totalCount: 4 } },
  ],
  poll: null,
};

describe("GitHub Discussions mapping", () => {
  it("maps categories to boards case-insensitively and skips unknown ones", () => {
    expect(boardForCategory("q&a")?.slug).toBe("qa");
    expect(mapDiscussion({ ...discussion, category: { name: "Ideas" } }, new Set())).toBeNull();
  });

  it("maps a discussion into a thread", () => {
    const t = mapDiscussion(discussion, new Set([7]))!;
    expect(t).toMatchObject({ number: 7, id: "D_1", board: "qa", body: "內文", tags: ["react"], replyCount: 3, solved: true, featured: true, pinned: true });
    expect(t.reactions).toEqual([
      { kind: "up", count: 6 },
      { kind: "helpful", count: 2 },
      { kind: "thanks", count: 1 },
    ]);
    expect(t.author.login).toBe("alice");
  });

  it("hides authors on the rumor board and reads credibility from 👍/👎", () => {
    const t = mapDiscussion({ ...discussion, category: { name: "Rumors" } }, new Set())!;
    expect(t.anonymous).toBe(true);
    expect(t.author.login).toBe("anonymous");
    expect(JSON.stringify(t)).not.toContain("alice");
    expect(t.credibility).toEqual({ believe: 9, doubt: 4 });
  });

  it("puts meetups with a known city on the map", () => {
    const body = withMeta("聚會", { meetup: { city: "新竹", when: "週六", venue: "線上" } });
    const t = mapDiscussion({ ...discussion, body, category: { name: "Meetups" } }, new Set())!;
    expect(t.meetup).toMatchObject({ city: "新竹", going: 9 });
    expect(t.meetup?.lat).toBeCloseTo(24.8, 1);
  });
});

describe("mirrored issues", () => {
  it("extracts job facts without inventing them", () => {
    expect(jobFacts("[徵才][台北] React 工程師", [])).toMatchObject({ company: "未註明", place: "tpe", type: "full", pay: "未註明" });
    expect(jobFacts("[某公司] 遠端接案 月薪 6 萬", [])).toMatchObject({ company: "某公司", place: "remote", type: "contract", pay: "見內文" });
    expect(jobFacts("Frontend Intern", ["新竹"])).toMatchObject({ place: "hsc", type: "part" });
  });

  it("maps issues to read-only threads under /c/[board]/[number]", () => {
    const issue: RawIssue = {
      number: 42,
      title: "[徵才] Vue 工程師",
      body: "**hi**",
      html_url: "https://github.com/f2etw/jobs/issues/42",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z",
      comments: 2,
      user: { login: "bob", avatar_url: "https://avatars/b" },
      labels: [{ name: "Vue" }, "remote"],
      reactions: { "+1": 3 },
    };
    const t = mapIssue(issue, requireBoard("jobs"));
    expect(t).toMatchObject({ href: "/c/jobs/42", external: true, replyCount: 2, tags: ["vue", "remote"], excerpt: "hi" });
    expect(t.job?.place).toBe("remote");
  });
});

describe("sign-in helpers", () => {
  it("only allows same-site return paths", () => {
    expect(safeReturnTo("/t/1?x=2")).toBe("/t/1?x=2");
    for (const bad of [null, "", "https://evil.example", "//evil.example", "/\\evil.example", "/api/auth/login", "/login"]) {
      expect(safeReturnTo(bad)).toBe("/");
    }
  });

  it("converts token responses, including non-expiring tokens", () => {
    const now = 1_000_000;
    expect(toTokenSet({ access_token: "a", expires_in: 28800, refresh_token: "r", refresh_token_expires_in: 100 }, now)).toEqual({
      accessToken: "a",
      accessTokenExpiresAt: now + 28_800_000,
      refreshToken: "r",
      refreshTokenExpiresAt: now + 100_000,
    });
    const forever = toTokenSet({ access_token: "a" }, now);
    expect(forever.accessTokenExpiresAt).toBeGreaterThan(now + 1e12);
    expect(forever.refreshTokenExpiresAt).toBe(0);
    expect(() => toTokenSet({ error: "bad_verification_code", error_description: "The code is incorrect" })).toThrow("incorrect");
  });
});
