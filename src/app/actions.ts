"use server";

/**
 * Write operations (Server Actions). They validate input and then hand off to
 * the active adapter. With the fixture adapter nothing is persisted, and the
 * action says so instead of pretending to succeed. GitHub Discussions writes
 * (signed in with the member's own OAuth token) arrive with the GitHub adapter.
 */
import { getBoard } from "@/lib/boards";
import { dataSource } from "@/lib/forum";

export interface ActionState {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
}

const NOT_CONNECTED: ActionState = {
  ok: false,
  message: "尚未連接 GitHub Discussions，所以這次不會被儲存。內容已通過檢查，接上後就能直接發佈。",
};

function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function createThread(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const board = getBoard(text(formData, "board"));
  const title = text(formData, "title");
  const body = text(formData, "body");
  const tags = text(formData, "tags")
    .split(/[,\s#]+/)
    .filter(Boolean);
  const fieldErrors: Record<string, string> = {};
  if (!board) fieldErrors.board = "請選擇看板。";
  else if (board.maintainersOnly) fieldErrors.board = "這個看板只有版主可以發文。";
  if (title.length < 6) fieldErrors.title = "標題至少 6 個字。";
  if (title.length > 120) fieldErrors.title = "標題最多 120 個字。";
  if (body.length < 10) fieldErrors.body = "內文至少 10 個字。";
  if (tags.length > 5) fieldErrors.tags = "標籤最多 5 個。";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, message: "請修正標示的欄位。", fieldErrors };
  return notConnected();
}

/** Only the fixture adapter exists so far, so every valid write ends here. */
function notConnected(): ActionState {
  if (dataSource() !== "fixtures") throw new Error("GitHub writes are not implemented yet");
  return NOT_CONNECTED;
}

export async function createReply(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const body = text(formData, "body");
  if (body.length < 2) return { ok: false, message: "回覆內容不能是空的。", fieldErrors: { body: "請輸入回覆內容。" } };
  return notConnected();
}

export async function postRumor(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const body = text(formData, "body");
  if (body.length < 10) return { ok: false, message: "至少寫 10 個字。", fieldErrors: { body: "至少寫 10 個字。" } };
  if (body.length > 280) return { ok: false, message: "最多 280 字。", fieldErrors: { body: "最多 280 字。" } };
  return notConnected();
}
