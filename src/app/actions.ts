"use server";

/**
 * Write operations (Server Actions). Each one re-reads the session itself
 * (never trusting the client), validates input, then writes to GitHub
 * Discussions with the member's own token and refreshes the affected caches.
 *
 * With the fixture adapter nothing is persisted and the action says so.
 * Anonymous rumor posting is disabled until a bot account is configured.
 */
import { updateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getBoard } from "@/lib/boards";
import { githubApp } from "@/lib/config";
import { GitHubError } from "@/lib/github/graphql";
import { dataSource } from "@/lib/forum";
import { addComment, createDiscussion, setAnswer, setReaction, setUpvote, votePoll, type ReactionContent } from "@/lib/forum/github-write";
import { MEETUP_CITIES, normalizeTags } from "@/lib/forum/meta";
import { getWriteSession, SESSION_COOKIE } from "@/lib/session";

export interface ActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  /** Set when the member must sign in (again) before retrying. */
  needsLogin?: boolean;
}

const NOT_CONNECTED: ActionState = {
  ok: false,
  message: "尚未連接 GitHub Discussions，所以這次不會被儲存。內容已通過檢查，接上後就能直接發佈。",
};

function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** Resolves the member's token, or an ActionState explaining why we can't write. */
async function writer(): Promise<{ token: string } | ActionState> {
  if (dataSource() === "fixtures") return NOT_CONNECTED;
  if (!githubApp()) return { ok: false, message: "網站還沒有設定 GitHub 登入，暫時無法發文。" };
  const session = await getWriteSession();
  if ("error" in session) {
    return {
      ok: false,
      needsLogin: true,
      message: session.error === "expired" ? "登入已過期，請重新用 GitHub 登入。" : "請先用 GitHub 登入。",
    };
  }
  return { token: session.accessToken };
}

function fromGitHubError(err: unknown): ActionState {
  console.error("GitHub write failed:", err instanceof Error ? err.message : err);
  if (err instanceof GitHubError && err.status === 403) {
    return { ok: false, message: "GitHub 拒絕了這次操作。請確認 Grapevine 的 GitHub App 已安裝在論壇的 repo 上，並有 Discussions 寫入權限。" };
  }
  if (err instanceof GitHubError && err.status === 404) {
    return { ok: false, message: "找不到對應的 Discussions 分類，請聯絡版主建立。" };
  }
  return { ok: false, message: "GitHub 暫時沒有回應，請稍後再試。你的內容還在表單裡。" };
}

export async function createThread(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const board = getBoard(text(formData, "board"));
  const title = text(formData, "title");
  const body = text(formData, "body");
  const rawTags = text(formData, "tags");
  const tags = normalizeTags(rawTags);
  const city = text(formData, "city");
  const fieldErrors: Record<string, string> = {};
  if (!board) fieldErrors.board = "請選擇看板。";
  else if (board.maintainersOnly) fieldErrors.board = "這個看板只有版主可以發文。";
  else if (board.kind === "anonymous") fieldErrors.board = "匿名發文還沒有開放。";
  if (title.length < 6) fieldErrors.title = "標題至少 6 個字。";
  if (title.length > 120) fieldErrors.title = "標題最多 120 個字。";
  if (body.length < 10) fieldErrors.body = "內文至少 10 個字。";
  if (body.length > 20000) fieldErrors.body = "內文太長了（上限 20,000 字）。";
  if (rawTags && tags.length === 0) fieldErrors.tags = "標籤只能用文字、數字和 . _ + -。";
  if (tags.length > 5) fieldErrors.tags = "標籤最多 5 個。";
  if (board?.kind === "meetup" && !MEETUP_CITIES[city]) fieldErrors.city = "請選擇城市。";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, message: "請修正標示的欄位。", fieldErrors };

  const w = await writer();
  if (!("token" in w)) return w;

  let number: number;
  try {
    const meetup = board!.kind === "meetup" ? { city, when: text(formData, "when"), venue: text(formData, "venue") } : undefined;
    ({ number } = await createDiscussion(w.token, { board: board!.slug, title, body, meta: { tags, meetup } }));
  } catch (err) {
    return fromGitHubError(err);
  }
  updateTag("threads");
  redirect(`/t/${number}`);
}

export async function createReply(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const body = text(formData, "body");
  const discussionId = text(formData, "discussionId");
  const threadNumber = Number(text(formData, "thread"));
  if (body.length < 2) return { ok: false, message: "回覆內容不能是空的。", fieldErrors: { body: "請輸入回覆內容。" } };
  if (body.length > 20000) return { ok: false, message: "回覆太長了。", fieldErrors: { body: "上限 20,000 字。" } };

  const w = await writer();
  if (!("token" in w)) return w;
  if (!discussionId || !Number.isInteger(threadNumber)) return { ok: false, message: "找不到要回覆的主題。" };
  try {
    await addComment(w.token, discussionId, body, text(formData, "replyTo") || undefined);
  } catch (err) {
    return fromGitHubError(err);
  }
  updateTag(`thread-${threadNumber}`);
  updateTag("threads");
  return { ok: true, message: "回覆已送出。" };
}

export type ReactionKind = "up" | "helpful" | "thanks" | "believe" | "doubt";
const CONTENT: Record<Exclude<ReactionKind, "up">, ReactionContent> = {
  helpful: "HOORAY",
  thanks: "HEART",
  believe: "THUMBS_UP",
  doubt: "THUMBS_DOWN",
};

/** Toggle an upvote or a reaction on a discussion or comment. */
export async function react(input: { subjectId: string; threadNumber: number; kind: ReactionKind; on: boolean }): Promise<ActionState> {
  if (!input.subjectId || !(input.kind === "up" || input.kind in CONTENT)) return { ok: false, message: "無效的操作。" };
  const w = await writer();
  if (!("token" in w)) return w;
  try {
    if (input.kind === "up") await setUpvote(w.token, input.subjectId, input.on);
    else await setReaction(w.token, input.subjectId, CONTENT[input.kind], input.on);
  } catch (err) {
    return fromGitHubError(err);
  }
  updateTag(`thread-${input.threadNumber}`);
  updateTag("threads");
  return { ok: true, message: "" };
}

export async function vote(input: { pollOptionId: string; threadNumber: number }): Promise<ActionState> {
  if (!input.pollOptionId) return { ok: false, message: "無效的選項。" };
  const w = await writer();
  if (!("token" in w)) return w;
  try {
    await votePoll(w.token, input.pollOptionId);
  } catch (err) {
    return fromGitHubError(err);
  }
  updateTag(`thread-${input.threadNumber}`);
  return { ok: true, message: "已投票。" };
}

/** Mark (or unmark) a reply as the accepted answer. GitHub only allows the question's author or maintainers. */
export async function markAnswer(input: { commentId: string; threadNumber: number; on: boolean }): Promise<ActionState> {
  if (!input.commentId) return { ok: false, message: "無效的回覆。" };
  const w = await writer();
  if (!("token" in w)) return w;
  try {
    await setAnswer(w.token, input.commentId, input.on);
  } catch (err) {
    return fromGitHubError(err);
  }
  updateTag(`thread-${input.threadNumber}`);
  updateTag("threads");
  return { ok: true, message: input.on ? "已採納為解答。" : "已取消採納。" };
}

export async function postRumor(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const body = text(formData, "body");
  if (body.length < 10) return { ok: false, message: "至少寫 10 個字。", fieldErrors: { body: "至少寫 10 個字。" } };
  if (body.length > 280) return { ok: false, message: "最多 280 字。", fieldErrors: { body: "最多 280 字。" } };
  if (dataSource() === "fixtures") return NOT_CONNECTED;
  return { ok: false, message: "匿名發文還沒有開放：需要先設定代發用的 bot 帳號。目前可以為八卦投票。" };
}

export async function signOut(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}
