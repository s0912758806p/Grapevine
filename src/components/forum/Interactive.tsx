"use client";

/**
 * Client-side interactive pieces: reaction toggles, rumor credibility votes,
 * the reply box and the anonymous rumor box. Votes and reactions are local
 * until the GitHub adapter persists them; forms submit to Server Actions.
 */
import { useActionState, useState } from "react";
import { createReply, postRumor, type ActionState } from "@/app/actions";
import { Icon } from "@/components/Icon";
import type { ReactionCount } from "@/lib/forum/types";
import styles from "./forum.module.css";

const REACTION_LABEL: Record<ReactionCount["kind"], string> = { up: "推", helpful: "有幫助", thanks: "感謝" };

export function ReactionBar({ reactions }: { reactions: ReactionCount[] }) {
  const [mine, setMine] = useState<Record<string, boolean>>({});
  return (
    <div className="row" style={{ gap: 8 }}>
      {reactions.map((r) => {
        const on = !!mine[r.kind];
        return (
          <button
            key={r.kind}
            type="button"
            className="react"
            aria-pressed={on}
            onClick={() => setMine((m) => ({ ...m, [r.kind]: !on }))}
          >
            {REACTION_LABEL[r.kind]} <span>{r.count + (on ? 1 : 0)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CredibilityVote({ believe, doubt }: { believe: number; doubt: number }) {
  const [vote, setVote] = useState<0 | 1 | -1>(0);
  const up = believe + (vote === 1 ? 1 : 0);
  const down = doubt + (vote === -1 ? 1 : 0);
  const total = up + down;
  const pct = total === 0 ? 0 : Math.round((up / total) * 100);
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
        <button type="button" className={styles.vote} aria-pressed={vote === 1} onClick={() => setVote(vote === 1 ? 0 : 1)}>
          <Icon name="check" size={16} />
          可信
        </button>
        <button type="button" className={styles.vote} aria-pressed={vote === -1} onClick={() => setVote(vote === -1 ? 0 : -1)}>
          <Icon name="question" size={16} />
          存疑
        </button>
        <button type="button" className="icon-btn" aria-label="檢舉這則八卦" style={{ width: 40, height: 40 }}>
          <Icon name="flag" size={16} />
        </button>
      </div>
    </>
  );
}

export function FormStatus({ state }: { state: ActionState | null }) {
  if (!state) return null;
  return (
    <p role="status" className={`notice ${state.ok ? "tone-vine" : "tone-amber"}`} style={{ margin: 0 }}>
      <Icon name={state.ok ? "check" : "info"} className="ico-sm" />
      <span>{state.message}</span>
    </p>
  );
}

export function ReplyBox({ threadNumber }: { threadNumber: number }) {
  const [state, action, pending] = useActionState(createReply, null);
  return (
    <form action={action} className="card card-pad stack" style={{ gap: 12 }} aria-labelledby="reply-h">
      <input type="hidden" name="thread" value={threadNumber} />
      <label id="reply-h" htmlFor="reply-body" className="label" style={{ margin: 0 }}>
        回覆這個主題
      </label>
      <textarea
        id="reply-body"
        name="body"
        rows={5}
        className="field"
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
