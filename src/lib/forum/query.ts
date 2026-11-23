/**
 * Pure helpers that filter and order threads. Shared by every adapter so the
 * feed behaves the same whether data comes from GitHub or from fixtures.
 */
import type { ReactionCount, SortKey, Thread, ThreadQuery } from "./types";

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "hot", label: "熱門" },
  { key: "new", label: "最新" },
  { key: "top", label: "精華" },
  { key: "open", label: "未回覆" },
];

export function parseSort(value: string | string[] | undefined): SortKey {
  const v = Array.isArray(value) ? value[0] : value;
  return SORTS.some((s) => s.key === v) ? (v as SortKey) : "hot";
}

export function upCount(reactions: ReactionCount[]): number {
  return reactions.find((r) => r.kind === "up")?.count ?? 0;
}

/**
 * Hot score: engagement decayed by age (hours), similar in spirit to the
 * Hacker News formula. `now` is injectable for deterministic tests.
 */
export function hotScore(thread: Thread, now: number): number {
  const ageHours = Math.max(0, (now - Date.parse(thread.createdAt)) / 3_600_000);
  const engagement = upCount(thread.reactions) + thread.replyCount * 2;
  return (engagement + 1) / Math.pow(ageHours + 2, 1.5);
}

export function applyQuery(threads: Thread[], query: ThreadQuery, now = Date.now()): Thread[] {
  const q = query.q?.trim().toLowerCase();
  let list = threads.filter((t) => {
    if (query.board && t.board !== query.board) return false;
    if (query.tag && !t.tags.includes(query.tag)) return false;
    if (query.author && (t.anonymous || t.author.login !== query.author)) return false;
    if (q) {
      const haystack = `${t.title} ${t.excerpt} ${t.tags.join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  switch (query.sort ?? "hot") {
    case "new":
      list = [...list].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      break;
    case "top":
      list = list
        .filter((t) => t.featured)
        .sort((a, b) => upCount(b.reactions) - upCount(a.reactions));
      break;
    case "open":
      list = list
        .filter((t) => t.replyCount === 0)
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
      break;
    default:
      list = [...list].sort((a, b) => hotScore(b, now) - hotScore(a, now));
  }

  return query.limit ? list.slice(0, query.limit) : list;
}
