/**
 * Sortable thread list used by the home feed and board pages. Sort state lives
 * in the URL (?sort=) so every view is linkable and crawlable.
 */
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { listThreads } from "@/lib/forum";
import { SORTS } from "@/lib/forum/query";
import type { SortKey } from "@/lib/forum/types";
import { EmptyState, ThreadCard } from "./ThreadCard";
import styles from "./forum.module.css";

export function SortTabs({ basePath, current, extra = "" }: { basePath: string; current: SortKey; extra?: string }) {
  return (
    <nav aria-label="排序方式" className="seg-group">
      {SORTS.map((s) => (
        <Link
          key={s.key}
          href={s.key === "hot" ? `${basePath}${extra ? `?${extra}` : ""}` : `${basePath}?sort=${s.key}${extra ? `&${extra}` : ""}`}
          className="seg"
          aria-current={s.key === current ? "page" : undefined}
          scroll={false}
        >
          {s.label}
        </Link>
      ))}
    </nav>
  );
}

export async function ThreadList({ board, sort, showBoard = true }: { board?: string; sort: SortKey; showBoard?: boolean }) {
  const threads = (await listThreads({ board, sort })).filter((t) => !t.pinned);
  if (threads.length === 0) {
    return (
      <EmptyState
        title="目前沒有符合的主題"
        body={sort === "open" ? "每個問題都有人回覆了。" : "換個排序方式看看，或成為第一個發文的人。"}
      />
    );
  }
  return (
    <>
      {threads.map((t) => (
        <ThreadCard key={t.number} thread={t} showBoard={showBoard} />
      ))}
    </>
  );
}

export async function PinnedThreads({ board = "announcements" }: { board?: string }) {
  const pinned = (await listThreads({ board, sort: "new" })).filter((t) => t.pinned);
  return (
    <>
      {pinned.map((t) => (
        <article key={t.number} className={`card ${styles.pinned}`}>
          <Icon name="pin" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Link href={`/t/${t.number}`}>置頂｜{t.title}</Link>
            <p className="text-2" style={{ margin: "2px 0 0", fontSize: 13 }}>
              {t.excerpt}
            </p>
          </div>
        </article>
      ))}
    </>
  );
}

export function FeedSkeleton() {
  return (
    <div className="stack" aria-busy="true" aria-label="載入中">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`card ${styles.threadCard}`}>
          <div style={{ width: "30%", height: 20, borderRadius: 6, background: "var(--surface-2)" }} />
          <div style={{ width: "90%", height: 18, borderRadius: 6, background: "var(--surface-2)" }} />
          <div style={{ width: "70%", height: 16, borderRadius: 6, background: "var(--surface-2)" }} />
        </div>
      ))}
    </div>
  );
}
