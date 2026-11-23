"use client";

/**
 * Client-side interactive pieces: reactions, rumor credibility votes, poll
 * votes, the reply box and the anonymous rumor box. Toggles update
 * optimistically and roll back if the Server Action fails.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { createReply, markAnswer, postRumor, react, vote, type ActionState, type ReactionKind } from "@/app/actions";
import { Icon } from "@/components/Icon";
import type { PollOption, ReactionCount } from "@/lib/forum/types";
import styles from "./forum.module.css";

const REACTION_LABEL: Record<ReactionCount["kind"], string> = { up: "推", helpful: "有幫助", thanks: "感謝" };

export function FormStatus({ state }: { state: ActionState | null }) {
  const pathname = usePathname();
  if (!state || !state.message) return null;
  return (
    <p role="status" className={`notice ${state.ok ? "tone-vine" : "tone-amber"}`} style={{ margin: 0 }}>
      <Icon name={state.ok ? "check" : "info"} className="ico-sm" />
      <span>
        {state.message}
        {state.needsLogin && (
          <>
            {" "}
            <a href={`/api/auth/login?returnTo=${encodeURIComponent(pathname)}`}>用 GitHub 登入</a>
          </>
        )}
      </span>
    </p>
  );
}

/** Shared optimistic toggle: flips local state, calls `react`, rolls back on failure. */
function useToggle(subjectId: string | undefined, threadNumber: number) {
  const [mine, setMine] = useState<Partial<Record<ReactionKind, boolean>>>({});
  const [error, setError] = useState<ActionState | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(kind: ReactionKind, on: boolean, also?: { kind: ReactionKind; on: boolean }) {
    const before = mine;
    setMine({ ...mine, [kind]: on, ...(also ? { [also.kind]: also.on } : {}) });
    setError(null);
    if (!subjectId) return; // sample data: local only
    startTransition(async () => {
      let result = await react({ subjectId, threadNumber, kind, on });
      if (result.ok && also) result = await react({ subjectId, threadNumber, kind: also.kind, on: also.on });
      if (!result.ok) {
        setMine(before);
        setError(result);
      }
    });
  }
  return { mine, toggle, error, pending };
}

export function ReactionBar({ reactions, subjectId, threadNumber }: { reactions: ReactionCount[]; subjectId?: string; threadNumber: number }) {
  const { mine, toggle, error, pending } = useToggle(subjectId, threadNumber);
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="row" style={{ gap: 8 }} aria-busy={pending}>
        {reactions.map((r) => {
          const on = !!mine[r.kind];
          return (
            <button key={r.kind} type="button" className="react" aria-pressed={on} onClick={() => toggle(r.kind, !on)}>
              {REACTION_LABEL[r.kind]} <span>{r.count + (on ? 1 : 0)}</span>
            </button>
          );
        })}
      </div>
      <FormStatus state={error} />
    </div>
  );
}

export function CredibilityVote({ believe, doubt, subjectId, threadNumber }: { believe: number; doubt: number; subjectId?: string; threadNumber: number }) {
  const { mine, toggle, error } = useToggle(subjectId, threadNumber);
  const up = believe + (mine.believe ? 1 : 0);
  const down = doubt + (mine.doubt ? 1 : 0);
  const total = up + down;
  const pct = total === 0 ? 0 : Math.round((up / total) * 100);
  const pick = (kind: "believe" | "doubt") => {
    const other = kind === "believe" ? "doubt" : "believe";
    if (mine[kind]) toggle(kind, false);
    else toggle(kind, true, mine[other] ? { kind: other, on: false } : undefined);
  };
  return (
    <>
      <div>
        <div className="row text-2" style={{ justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
          <span>可信 {pct}%</span>
          <span>{total} 票</span>
        </div>
        <div className={styles.credBar} aria-hidden="true">
          <div className={styles.credFill} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="row" style={{ gap: 8, flexWrap: "nowrap" }}>
        <button type="button" className={styles.vote} aria-pressed={!!mine.believe} onClick={() => pick("believe")}>
          <Icon name="check" size={16} />
          可信
        </button>
        <button type="button" className={styles.vote} aria-pressed={!!mine.doubt} onClick={() => pick("doubt")}>
          <Icon name="question" size={16} />
          存疑
        </button>
      </div>
      <FormStatus state={error} />
    </>
  );
}

export function PollVote({ options, threadNumber }: { options: PollOption[]; threadNumber: number }) {
  const [state, setState] = useState<ActionState | null>(null);
  const [pending, startTransition] = useTransition();
  if (!options.some((o) => o.id)) return null;
  return (
    <div className="stack" style={{ gap: 8 }}>
      <div className="row" style={{ gap: 8 }}>
        {options.map((o) =>
          o.id ? (
            <button
              key={o.id}
              type="button"
              className="btn"
              disabled={pending}
              onClick={() => startTransition(async () => setState(await vote({ pollOptionId: o.id!, threadNumber })))}
            >
              投給「{o.label}」
            </button>
          ) : null,
        )}
      </div>
      <FormStatus state={state} />
    </div>
  );
}

export function ReplyBox({
  threadNumber,
  discussionId,
  replyToId,
  label = "回覆這個主題",
  onDone,
}: {
  threadNumber: number;
  discussionId?: string;
  /** Top-level comment to reply under (GitHub allows one level of nesting). */
  replyToId?: string;
  label?: string;
  onDone?: () => void;
}) {
  const [body, setBody] = useState("");
  const fieldId = replyToId ? `reply-${replyToId}` : "reply-body";
  const [state, action, pending] = useActionState(async (prev: ActionState | null, formData: FormData) => {
    const result = await createReply(prev, formData);
    if (result.ok) {
      setBody("");
      onDone?.();
    }
    return result;
  }, null);
  return (
    <form action={action} className={replyToId ? "stack" : "card card-pad stack"} style={{ gap: 12 }}>
      <input type="hidden" name="thread" value={threadNumber} />
      <input type="hidden" name="discussionId" value={discussionId ?? ""} />
      {replyToId && <input type="hidden" name="replyTo" value={replyToId} />}
      <label htmlFor={fieldId} className="label" style={{ margin: 0 }}>
        {label}
      </label>
      <textarea
        id={fieldId}
        name="body"
        rows={replyToId ? 3 : 5}
        className="field"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="分享你的看法。支援 Markdown，程式碼請用 ``` 包起來。"
        aria-invalid={!!state?.fieldErrors?.body}
      />
      <FormStatus state={state} />
      <div className="row" style={{ gap: 12 }}>
        <span className="muted" style={{ fontSize: 13 }}>
          回覆會以你的 GitHub 帳號發佈在 Discussions。
        </span>
        <button className="btn btn-primary" type="submit" disabled={pending} style={{ marginLeft: "auto" }}>
          {pending ? "送出中…" : "送出回覆"}
        </button>
      </div>
    </form>
  );
}

/**
 * Actions under a reply: upvote, reply (nested under the top-level comment),
 * and — for the question's author on Q&A threads — mark as the accepted answer.
 */
export function CommentActions({
  commentId,
  parentId,
  threadNumber,
  discussionId,
  ups,
  live,
  canMarkAnswer = false,
  isAnswer = false,
}: {
  commentId: string;
  parentId: string;
  threadNumber: number;
  discussionId?: string;
  ups: number;
  /** False for sample data: toggles stay local and nothing is sent. */
  live: boolean;
  canMarkAnswer?: boolean;
  isAnswer?: boolean;
}) {
  const { mine, toggle, error } = useToggle(live ? commentId : undefined, threadNumber);
  const [replying, setReplying] = useState(false);
  const [answerState, setAnswerState] = useState<ActionState | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <div className="stack" style={{ gap: 8, marginTop: 10 }}>
      <div className="row" style={{ gap: 4 }}>
        <button type="button" className="react" aria-pressed={!!mine.up} onClick={() => toggle("up", !mine.up)}>
          推 <span>{ups + (mine.up ? 1 : 0)}</span>
        </button>
        <button type="button" className="btn btn-quiet" aria-expanded={replying} onClick={() => setReplying(!replying)}>
          回覆
        </button>
        {canMarkAnswer && live && (
          <button
            type="button"
            className="btn btn-quiet"
            disabled={pending}
            onClick={() => startTransition(async () => setAnswerState(await markAnswer({ commentId, threadNumber, on: !isAnswer })))}
          >
            <Icon name="checkCircle" size={16} />
            {isAnswer ? "取消採納" : "採納為解答"}
          </button>
        )}
      </div>
      <FormStatus state={error} />
      <FormStatus state={answerState} />
      {replying && (
        <ReplyBox threadNumber={threadNumber} discussionId={discussionId} replyToId={parentId} label="回覆這則留言" onDone={() => setReplying(false)} />
      )}
    </div>
  );
}

export function RumorBox() {
  const [state, action, pending] = useActionState(postRumor, null);
  return (
    <form action={action} className="card card-pad stack" style={{ gap: 10 }}>
      <label htmlFor="rumor-body" className="label" style={{ margin: 0 }}>
        匿名爆料
      </label>
      <textarea id="rumor-body" name="body" rows={3} maxLength={280} className="field" placeholder="你聽說了什麼？最多 280 字。" />
      <FormStatus state={state} />
      <div className="row" style={{ gap: 12 }}>
        <span className="muted" style={{ fontSize: 13 }}>
          對外顯示為「匿名葡萄」。伺服器會記錄帳號以限制頻率、處理檢舉。
        </span>
        <button className="btn btn-primary" type="submit" disabled={pending} style={{ marginLeft: "auto" }}>
          {pending ? "送出中…" : "匿名送出"}
        </button>
      </div>
    </form>
  );
}

export function SignInPrompt({ returnTo, children }: { returnTo: string; children: React.ReactNode }) {
  return (
    <div className="card card-pad stack" style={{ gap: 10, alignItems: "flex-start" }}>
      <p style={{ margin: 0 }}>{children}</p>
      <Link className="btn btn-primary" href={`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`} prefetch={false}>
        <Icon name="github" />
        用 GitHub 登入
      </Link>
    </div>
  );
}
