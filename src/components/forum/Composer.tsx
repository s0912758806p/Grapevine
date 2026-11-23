"use client";

/**
 * New-thread form (design: 發表主題). Board picker, title, Markdown body with
 * a live preview tab, tags and an optional poll. Submits to the createThread
 * Server Action; the draft is kept in localStorage until it is published.
 */
import { useActionState, useState, useSyncExternalStore } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import { createThread } from "@/app/actions";
import { Icon } from "@/components/Icon";
import type { Board } from "@/lib/boards";
import { FormStatus } from "./Interactive";
import styles from "./composer.module.css";

const DRAFT_KEY = "grapevine:draft";

interface Draft {
  board: string;
  title: string;
  body: string;
  tags: string;
}

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

export function Composer({ boards, initialBoard }: { boards: Pick<Board, "slug" | "name" | "hint" | "kind" | "maintainersOnly">[]; initialBoard: string }) {
  const [draft, setDraft] = useState<Draft>({ board: initialBoard, title: "", body: "", tags: "" });
  const [restored, setRestored] = useState(false);
  // The saved draft is only readable in the browser, so offer it after hydration instead of rendering it on the server.
  const hasSavedDraft = useSyncExternalStore(noopSubscribe, () => readDraft() !== null, () => false);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [poll, setPoll] = useState(false);
  const [options, setOptions] = useState(["", ""]);
  const [state, action, pending] = useActionState(createThread, null);
  const current = boards.find((b) => b.slug === draft.board);
  const err = state?.fieldErrors ?? {};

  function update(patch: Partial<Draft>) {
    setDraft((d) => {
      const next = { ...d, ...patch };
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next));
      } catch {
        // Drafts are a convenience; ignore storage failures.
      }
      return next;
    });
  }

  return (
    <form action={action} className="stack" style={{ gap: 22 }}>
      {hasSavedDraft && !restored && !draft.title && !draft.body && (
        <div className="notice tone-grape">
          <Icon name="info" />
          <span style={{ flex: 1 }}>這台裝置上有一份還沒發佈的草稿。</span>
          <button
            type="button"
            className="btn btn-quiet"
            onClick={() => {
              const saved = readDraft();
              if (saved) setDraft({ ...saved, board: saved.board || initialBoard });
              setRestored(true);
            }}
          >
            載入草稿
          </button>
        </div>
      )}
      <fieldset className={styles.fieldset}>
        <legend className="label">選擇看板</legend>
        <div className={styles.boardGrid}>
          {boards.map((b) => (
            <label key={b.slug} className={styles.boardOpt} data-disabled={b.maintainersOnly || undefined}>
              <input
                type="radio"
                name="board"
                value={b.slug}
                checked={draft.board === b.slug}
                disabled={b.maintainersOnly}
                onChange={() => update({ board: b.slug })}
                className="sr-only"
              />
              <span style={{ fontWeight: 700, fontSize: 14 }}>{b.name}</span>
              <span className="muted" style={{ fontSize: 12 }}>
                {b.hint}
              </span>
            </label>
          ))}
        </div>
        {err.board && <p className={styles.error}>{err.board}</p>}
      </fieldset>

      <div>
        <label className="label" htmlFor="t-title">
          標題
        </label>
        <input
          id="t-title"
          name="title"
          className="field"
          value={draft.title}
          onChange={(e) => update({ title: e.target.value })}
          maxLength={120}
          aria-invalid={!!err.title}
          aria-describedby="t-title-hint"
        />
        <p id="t-title-hint" className="hint">
          {err.title ?? "好標題讓人一眼看懂問題。"}
        </p>
      </div>

      <div className="card card-flat" style={{ overflow: "hidden" }}>
        <div className={styles.toolbar}>
          <div role="tablist" aria-label="編輯模式" style={{ display: "flex" }}>
            <button type="button" role="tab" className="tab" aria-selected={tab === "write"} onClick={() => setTab("write")}>
              撰寫
            </button>
            <button type="button" role="tab" className="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")}>
              預覽
            </button>
          </div>
          <span className="muted" style={{ marginLeft: "auto", fontSize: 13 }}>
            支援 Markdown
          </span>
        </div>
        <label htmlFor="t-body" className="sr-only">
          內文
        </label>
        <textarea
          id="t-body"
          name="body"
          rows={12}
          value={draft.body}
          onChange={(e) => update({ body: e.target.value })}
          className={styles.editor}
          hidden={tab !== "write"}
          aria-invalid={!!err.body}
          placeholder={"說明你想討論的事。\n\n程式碼請用 ``` 包起來。"}
        />
        {tab === "preview" && (
          <div className="prose" style={{ padding: "16px 18px", minHeight: 280 }}>
            {draft.body.trim() ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {draft.body}
              </ReactMarkdown>
            ) : (
              <p className="muted">還沒有內容可以預覽。</p>
            )}
          </div>
        )}
      </div>
      {err.body && <p className={styles.error}>{err.body}</p>}

      <div>
        <label className="label" htmlFor="t-tags">
          標籤（最多 5 個，用空白或逗號分隔）
        </label>
        <input id="t-tags" name="tags" className="field" value={draft.tags} onChange={(e) => update({ tags: e.target.value })} placeholder="react, suspense" />
        {err.tags && <p className={styles.error}>{err.tags}</p>}
      </div>

      <div className="card card-flat card-pad stack" style={{ gap: 14 }}>
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>附加投票</div>
            <div className="muted" style={{ fontSize: 13 }}>
              讓大家用選的表態，結果會顯示在主題頁上。
            </div>
          </div>
          <button type="button" role="switch" aria-checked={poll} aria-label="附加投票" className={styles.switch} onClick={() => setPoll(!poll)}>
            <span className={styles.knob} />
          </button>
        </div>
        {poll && (
          <div className="stack" style={{ gap: 8 }}>
            {options.map((o, i) => (
              <label key={i} className="text-2" style={{ fontSize: 13 }}>
                選項 {i + 1}
                <input
                  className="field"
                  name="poll"
                  value={o}
                  onChange={(e) => setOptions(options.map((x, j) => (j === i ? e.target.value : x)))}
                  style={{ marginTop: 4 }}
                />
              </label>
            ))}
            {options.length < 6 && (
              <button type="button" className="btn" style={{ alignSelf: "flex-start" }} onClick={() => setOptions([...options, ""])}>
                新增選項
              </button>
            )}
          </div>
        )}
        {current?.kind === "anonymous" && (
          <div className="notice tone-rose">
            <Icon name="eyeOff" />
            <span>八卦牆的貼文會以「匿名葡萄」顯示。為了防止濫用，伺服器仍會記錄你的帳號並限制發文頻率，版主可處理檢舉。</span>
          </div>
        )}
      </div>

      <FormStatus state={state} />
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <span className="muted" style={{ fontSize: 13, marginRight: "auto" }}>
          草稿會自動存在這台裝置。
        </span>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "發佈中…" : "發佈主題"}
        </button>
      </div>
    </form>
  );
}
