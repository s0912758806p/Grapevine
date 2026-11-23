/**
 * Mirrored boards: read-only content from external issue trackers
 * (ruanyf/weekly for 週刊共讀, f2etw/jobs for 職缺), mapped into Threads.
 * Mirrored items live at /c/[board]/[number] so their numbers never collide
 * with forum Discussion numbers at /t/[number].
 */
import type { Board } from "../boards";
import { excerptOf } from "./meta";
import type { Thread } from "./types";

export interface RawIssue {
  number: number;
  title: string;
  body: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  comments: number;
  user: { login: string; avatar_url: string } | null;
  labels: ({ name?: string } | string)[];
  reactions?: { "+1"?: number; heart?: number; hooray?: number };
  pull_request?: unknown;
}

type Job = NonNullable<Thread["job"]>;

const POST_TYPES = /^(徵才|徵人|招募|求職|求才|職缺|轉職|hiring|job|remote|遠端|全職|兼職|實習|接案)$/i;

/** Best-effort job facts from title and labels; unknown values stay honest ("未註明"). */
export function jobFacts(title: string, labels: string[]): Job {
  const text = `${title} ${labels.join(" ")}`.toLowerCase();
  const place: Job["place"] = /遠端|remote|wfh/.test(text)
    ? "remote"
    : /台北|臺北|新北|taipei/.test(text)
      ? "tpe"
      : /新竹|竹北|hsinchu/.test(text)
        ? "hsc"
        : /台中|臺中|taichung/.test(text)
          ? "txg"
          : "other";
  const placeLabel = { remote: "遠端", tpe: "台北", hsc: "新竹", txg: "台中", other: "未註明" }[place];
  const type: Job["type"] = /接案|外包|freelance|contract/.test(text) ? "contract" : /兼職|實習|intern|part[- ]?time/.test(text) ? "part" : "full";
  // Leading brackets are usually post types ([徵才], [求職]) rather than company names.
  const bracket = title.match(/^\s*[[【]([^\]】]{1,40})[\]】]/)?.[1]?.trim();
  const company = bracket && !POST_TYPES.test(bracket) ? bracket : "未註明";
  return { company, place, placeLabel, type, pay: /薪資|salary|\d+\s*[kK萬]/.test(text) ? "見內文" : "未註明" };
}

export function mapIssue(issue: RawIssue, board: Board): Thread {
  const labels = issue.labels.map((l) => (typeof l === "string" ? l : (l.name ?? ""))).filter(Boolean);
  const body = issue.body ?? "";
  return {
    number: issue.number,
    board: board.slug,
    href: `/c/${board.slug}/${issue.number}`,
    title: issue.title,
    excerpt: excerptOf(body) || issue.title,
    body,
    author: issue.user ? { login: issue.user.login, name: issue.user.login, avatarUrl: issue.user.avatar_url } : { login: "ghost", name: "ghost" },
    external: true,
    createdAt: issue.created_at,
    lastActivityAt: issue.updated_at,
    tags: labels.slice(0, 4).map((l) => l.toLowerCase()),
    replyCount: issue.comments,
    reactions: [
      { kind: "up", count: issue.reactions?.["+1"] ?? 0 },
      { kind: "helpful", count: issue.reactions?.hooray ?? 0 },
      { kind: "thanks", count: issue.reactions?.heart ?? 0 },
    ],
    url: issue.html_url,
    job: board.slug === "jobs" ? jobFacts(issue.title, labels) : undefined,
  };
}
