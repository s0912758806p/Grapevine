import { describe, expect, it } from "vitest";
import { formatAbsolute, formatRelative } from "@/lib/format";
import { LEVELS, badgesFor, levelFor, xpFromStats } from "@/lib/levels";

const stats = { threads: 2, replies: 10, accepted: 1, upsReceived: 20, meetups: 0, weeklyStreak: 0 };

describe("levels", () => {
  it("computes XP from real activity", () => {
    expect(xpFromStats(stats)).toBe(2 * 25 + 10 * 5 + 30 + 20);
  });

  it("maps XP to levels at the thresholds", () => {
    expect(levelFor(0).level).toBe(1);
    expect(levelFor(49).level).toBe(1);
    expect(levelFor(50).level).toBe(2);
    expect(levelFor(-5).xp).toBe(0);
    const top = levelFor(LEVELS[LEVELS.length - 1].minXp + 10);
    expect(top.level).toBe(LEVELS.length);
    expect(top.next).toBeNull();
    expect(top.progress).toBe(100);
  });

  it("reports progress and remaining XP to the next level", () => {
    const info = levelFor(100); // between 50 (Lv2) and 150 (Lv3)
    expect(info.next).toEqual({ level: 3, title: "枝條", remaining: 50 });
    expect(info.progress).toBe(50);
  });

  it("awards badges only when earned", () => {
    const badges = badgesFor(stats, 120);
    expect(badges.find((b) => b.id === "first-thread")?.earned).toBe(true);
    expect(badges.find((b) => b.id === "voice")?.earned).toBe(true);
    expect(badges.find((b) => b.id === "solver")?.earned).toBe(false);
  });
});

describe("format", () => {
  it("formats absolute times in Taipei without Intl spacing quirks", () => {
    expect(formatAbsolute("2026-11-23T06:05:00Z")).toBe("11/23 14:05");
    expect(formatAbsolute("2026-12-31T17:00:00Z")).toBe("1/1 01:00");
  });

  it("formats relative times in zh-TW", () => {
    const now = Date.parse("2026-11-23T08:00:00Z");
    expect(formatRelative("2026-11-23T07:59:30Z", now)).toBe("剛剛");
    expect(formatRelative("2026-11-23T06:00:00Z", now)).toBe("2 小時前");
    expect(formatRelative("2026-11-20T08:00:00Z", now)).toBe("3 天前");
  });
});
