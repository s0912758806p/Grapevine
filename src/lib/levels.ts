/**
 * Member levels and badges, computed from real forum activity (no client-side
 * XP bookkeeping). Thresholds carry over from the v1 character system; titles
 * are the Traditional Chinese names used throughout the UI.
 */
import type { MemberProfile } from "./forum/types";

export const LEVELS = [
  { level: 1, title: "種子", minXp: 0 },
  { level: 2, title: "新芽", minXp: 50 },
  { level: 3, title: "枝條", minXp: 150 },
  { level: 4, title: "藤蔓棚", minXp: 350 },
  { level: 5, title: "老藤", minXp: 700 },
  { level: 6, title: "釀酒師", minXp: 1200 },
  { level: 7, title: "首席釀酒師", minXp: 2000 },
] as const;

export const XP_RULES = { thread: 25, reply: 5, accepted: 30, upReceived: 1 } as const;

export function xpFromStats(stats: MemberProfile["stats"]): number {
  return (
    stats.threads * XP_RULES.thread +
    stats.replies * XP_RULES.reply +
    stats.accepted * XP_RULES.accepted +
    stats.upsReceived * XP_RULES.upReceived
  );
}

export interface LevelInfo {
  level: number;
  title: string;
  xp: number;
  /** Next level, or null at the top level. */
  next: { level: number; title: string; remaining: number } | null;
  /** 0–100 progress towards the next level. */
  progress: number;
}

export function levelFor(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));
  let index = 0;
  LEVELS.forEach((l, i) => {
    if (safeXp >= l.minXp) index = i;
  });
  const current = LEVELS[index];
  const next = LEVELS[index + 1];
  if (!next) return { level: current.level, title: current.title, xp: safeXp, next: null, progress: 100 };
  const span = next.minXp - current.minXp;
  return {
    level: current.level,
    title: current.title,
    xp: safeXp,
    next: { level: next.level, title: next.title, remaining: next.minXp - safeXp },
    progress: Math.round(((safeXp - current.minXp) / span) * 100),
  };
}

export function levelLabel(xp: number): string {
  const info = levelFor(xp);
  return `Lv.${info.level} ${info.title}`;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
}

export function badgesFor(stats: MemberProfile["stats"], topThreadUps: number): Badge[] {
  return [
    { id: "first-thread", name: "第一篇主題", description: "發表第一個主題", earned: stats.threads >= 1 },
    { id: "solver", name: "解惑者", description: "10 則回覆被採納", earned: stats.accepted >= 10 },
    { id: "weekly-regular", name: "週刊常客", description: "連續 4 週參與共讀", earned: stats.weeklyStreak >= 4 },
    { id: "meetup-buddy", name: "聚會夥伴", description: "報名 3 場在地聚會", earned: stats.meetups >= 3 },
    { id: "voice", name: "藤蔓之聲", description: "單篇主題獲得 100 推", earned: topThreadUps >= 100 },
    { id: "curator", name: "策展人", description: "發表 50 個主題", earned: stats.threads >= 50 },
  ];
}
