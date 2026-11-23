/**
 * Feed card for a thread (design: 首頁動態牆). Server component; only the
 * bookmark toggle and relative time hydrate on the client.
 */
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { upCount } from "@/lib/forum/query";
import type { Thread } from "@/lib/forum/types";
import { Avatar, BoardChip, SolvedChip } from "./bits";
import { BookmarkButton } from "./BookmarkButton";
import { RelativeTime } from "./RelativeTime";
import styles from "./forum.module.css";

export function ThreadCard({ thread, showBoard = true }: { thread: Thread; showBoard?: boolean }) {
  const href = thread.href ?? `/t/${thread.number}`;
  return (
    <article className={`card ${styles.threadCard}`}>
      <div className="row" style={{ gap: 8 }}>
        {showBoard && <BoardChip slug={thread.board} link />}
        {thread.solved && <SolvedChip />}
        {thread.poll && (
          <span className="chip tone-neutral">
            <Icon name="poll" size={14} />
            投票中
          </span>
        )}
        {thread.tags.map((tag) => (
          <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`} className="tag">
            #{tag}
          </Link>
        ))}
      </div>
      <h2 className={styles.threadTitle}>
        <Link href={href}>{thread.title}</Link>
      </h2>
      <p className={styles.excerpt}>{thread.excerpt}</p>
      <div className={styles.meta}>
        <Avatar member={thread.author} anonymous={thread.anonymous} />
        <span className="text-2" style={{ fontWeight: 600 }}>
          {thread.anonymous ? "匿名葡萄" : thread.author.name}
        </span>
        <span aria-hidden="true">·</span>
        <RelativeTime iso={thread.createdAt} />
        <span className={styles.metaRight}>
          <span className={styles.stat}>
            <Icon name="up" size={16} />
            <span className="sr-only">推</span>
            {upCount(thread.reactions)}
          </span>
          <span className={styles.stat}>
            <Icon name="chat" size={16} />
            <span className="sr-only">回覆</span>
            {thread.replyCount}
          </span>
          <BookmarkButton number={thread.number} href={thread.href} title={thread.title} board={thread.board} />
        </span>
      </div>
    </article>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="card empty">
      <strong>{title}</strong>
      <span style={{ fontSize: 14 }}>{body}</span>
    </div>
  );
}
