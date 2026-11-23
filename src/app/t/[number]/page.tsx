import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { Avatar, BoardChip, Markdown, MemberLink, SolvedChip } from "@/components/forum/bits";
import { BookmarkButton } from "@/components/forum/BookmarkButton";
import { FeedSkeleton } from "@/components/forum/Feed";
import { CredibilityVote, PollVote, ReactionBar, ReplyBox } from "@/components/forum/Interactive";
import { RelativeTime } from "@/components/forum/RelativeTime";
import styles from "@/components/forum/forum.module.css";
import { Columns } from "@/components/layout/Columns";
import { getBoard } from "@/lib/boards";
import { dataSource, getThread, listThreads } from "@/lib/forum";
import { upCount } from "@/lib/forum/query";
import type { Reply, ThreadDetail } from "@/lib/forum/types";

// Prerender the newest threads; others render on first visit. Cache Components
// requires at least one entry, so an empty forum (or a GitHub outage at build
// time) falls back to a placeholder that simply renders "not found".
export async function generateStaticParams() {
  try {
    const threads = (await listThreads({ sort: "new", limit: 50 })).filter((t) => !t.external);
    if (threads.length > 0) return threads.map((t) => ({ number: String(t.number) }));
  } catch (err) {
    console.warn("Could not list threads for prerendering:", err instanceof Error ? err.message : err);
  }
  return [{ number: "1" }];
}

async function load(params: PageProps<"/t/[number]">["params"]) {
  const { number } = await params;
  const n = Number(number);
  if (!Number.isInteger(n) || n <= 0) return null;
  return getThread(n);
}

export async function generateMetadata(props: PageProps<"/t/[number]">): Promise<Metadata> {
  const thread = await load(props.params);
  if (!thread) return {};
  return {
    title: thread.title,
    description: thread.excerpt,
    alternates: { canonical: `/t/${thread.number}` },
    openGraph: { type: "article", title: thread.title, description: thread.excerpt, publishedTime: thread.createdAt },
  };
}

function ReplyItem({ reply }: { reply: Reply }) {
  return (
    <article className={`card ${styles.reply}`}>
      <div className="row" style={{ marginBottom: 8 }}>
        <Avatar member={reply.author} size={32} />
        <MemberLink member={reply.author} />
        <span className="muted" style={{ fontSize: 13 }}>
          <RelativeTime iso={reply.createdAt} />
        </span>
      </div>
      <Markdown source={reply.body} />
      <div className="row" style={{ gap: 4, marginTop: 10 }}>
        <span className="react">推 {reply.ups}</span>
      </div>
      {reply.replies && reply.replies.length > 0 && (
        <details open>
          <summary className={styles.childToggle}>{reply.replies.length} 則回覆</summary>
          <div className={styles.children}>
            {reply.replies.map((child) => (
              <div key={child.id}>
                <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                  <Avatar member={child.author} size={26} />
                  <MemberLink member={child.author} />
                  <span className="muted" style={{ fontSize: 12 }}>
                    <RelativeTime iso={child.createdAt} />
                  </span>
                </div>
                <Markdown source={child.body} />
              </div>
            ))}
          </div>
        </details>
      )}
    </article>
  );
}

function JsonLd({ thread }: { thread: ThreadDetail }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: thread.title,
    text: thread.excerpt,
    datePublished: thread.createdAt,
    url: `/t/${thread.number}`,
    author: { "@type": "Person", name: thread.anonymous ? "匿名" : thread.author.name },
    interactionStatistic: [
      { "@type": "InteractionCounter", interactionType: "https://schema.org/CommentAction", userInteractionCount: thread.replyCount },
      { "@type": "InteractionCounter", interactionType: "https://schema.org/LikeAction", userInteractionCount: upCount(thread.reactions) },
    ],
  };
  // JSON.stringify output with "<" escaped cannot break out of the script element.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

async function ThreadView({ params }: { params: PageProps<"/t/[number]">["params"] }) {
  const thread = await load(params);
  if (!thread) notFound();
  const board = getBoard(thread.board);
  const shownReplies = thread.replies.length + (thread.answer ? 1 : 0);
  const pollTotal = thread.poll?.reduce((n, o) => n + o.votes, 0) ?? 0;

  return (
    <Columns
      nav={false}
      aside={
        <>
          <section className={`card ${styles.widget} stack`} style={{ gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 15 }}>主題資訊</h2>
            <div className={styles.infoRow}>
              <span className="muted">發表</span>
              <RelativeTime iso={thread.createdAt} />
            </div>
            <div className={styles.infoRow}>
              <span className="muted">最後活動</span>
              <RelativeTime iso={thread.lastActivityAt} />
            </div>
            <div className={styles.infoRow}>
              <span className="muted">參與者</span>
              <span>{thread.participants.length} 人</span>
            </div>
            {thread.participants.length > 0 && (
              <div className={styles.facepile}>
                {thread.participants.slice(0, 6).map((p) => (
                  <Avatar key={p.login} member={p} size={32} />
                ))}
              </div>
            )}
            <BookmarkButton number={thread.number} title={thread.title} board={thread.board} withLabel />
            {thread.url && (
              <a href={thread.url} className="btn btn-quiet" style={{ justifyContent: "flex-start" }}>
                <Icon name="github" size={16} />
                在 GitHub 開啟
              </a>
            )}
          </section>
          {thread.related.length > 0 && (
            <section className={`card ${styles.widget}`}>
              <h2 className={styles.widgetTitle}>相關主題</h2>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
                {thread.related.map((r) => (
                  <li key={r.number}>
                    <Link href={`/t/${r.number}`} style={{ color: "var(--text)", fontWeight: 600 }}>
                      {r.title}
                    </Link>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {getBoard(r.board)?.name} · {r.replyCount > 0 ? `${r.replyCount} 則回覆` : "尚無回覆"}
                      {r.solved ? " · 已解決" : ""}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      }
    >
      <JsonLd thread={thread} />
      <nav aria-label="麵包屑" className="muted row" style={{ fontSize: 14, gap: 8 }}>
        <Link href="/">動態牆</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/c/${thread.board}`}>{board?.name}</Link>
      </nav>
      <div className="stack" style={{ gap: 10 }}>
        <div className="row" style={{ gap: 8 }}>
          <BoardChip slug={thread.board} link />
          {thread.solved && <SolvedChip />}
          {thread.tags.map((g) => (
            <Link key={g} href={`/search?tag=${encodeURIComponent(g)}`} className="tag">
              #{g}
            </Link>
          ))}
        </div>
        <h1 className="page-title">{thread.title}</h1>
      </div>

      <article className={`card ${styles.post}`}>
        <div className={styles.postHead}>
          <Avatar member={thread.author} size={32} anonymous={thread.anonymous} />
          <MemberLink member={thread.author} anonymous={thread.anonymous} />
          <span className="muted" style={{ fontSize: 13 }}>
            <RelativeTime iso={thread.createdAt} prefix="發表於 " />
          </span>
          {thread.url && (
            <a href={thread.url} style={{ marginLeft: "auto", fontSize: 13 }}>
              在 GitHub 查看原文
            </a>
          )}
        </div>
        <Markdown source={thread.body} />
        {thread.job && (
          <dl className="row text-2" style={{ gap: 18, fontSize: 14, margin: "12px 0 0" }}>
            <div><dt className="muted" style={{ display: "inline" }}>公司 </dt><dd style={{ display: "inline", margin: 0 }}>{thread.job.company}</dd></div>
            <div><dt className="muted" style={{ display: "inline" }}>地點 </dt><dd style={{ display: "inline", margin: 0 }}>{thread.job.placeLabel}</dd></div>
            <div><dt className="muted" style={{ display: "inline" }}>薪資 </dt><dd style={{ display: "inline", margin: 0 }}>{thread.job.pay}</dd></div>
          </dl>
        )}
        {thread.meetup && (
          <dl className="row text-2" style={{ gap: 18, fontSize: 14, margin: "12px 0 0" }}>
            <div><dt className="muted" style={{ display: "inline" }}>城市 </dt><dd style={{ display: "inline", margin: 0 }}>{thread.meetup.city}</dd></div>
            <div><dt className="muted" style={{ display: "inline" }}>時間 </dt><dd style={{ display: "inline", margin: 0 }}>{thread.meetup.when || "見內文"}</dd></div>
            <div><dt className="muted" style={{ display: "inline" }}>地點 </dt><dd style={{ display: "inline", margin: 0 }}>{thread.meetup.venue || "見內文"}</dd></div>
          </dl>
        )}
        {thread.poll && (
          <section aria-label="投票結果" className="stack" style={{ gap: 10, marginTop: 16 }}>
            {thread.pollQuestion && <strong>{thread.pollQuestion}</strong>}
            {thread.poll.map((o) => {
              const pct = pollTotal ? Math.round((o.votes / pollTotal) * 100) : 0;
              return (
                <div key={o.label} className={styles.pollOption}>
                  <span>{o.label}</span>
                  <span className="text-2">{pct}%（{o.votes} 票）</span>
                  <span className={styles.pollBar} aria-hidden="true">
                    <span className={styles.pollFill} style={{ width: `${pct}%` }} />
                  </span>
                </div>
              );
            })}
            <PollVote options={thread.poll} threadNumber={thread.number} />
          </section>
        )}
        {thread.credibility && (
          <div className="stack" style={{ gap: 10, marginTop: 16, maxWidth: 420 }}>
            <CredibilityVote believe={thread.credibility.believe} doubt={thread.credibility.doubt} subjectId={thread.id} threadNumber={thread.number} />
          </div>
        )}
        <div className="row" style={{ gap: 8, marginTop: 16 }}>
          <ReactionBar reactions={thread.reactions} subjectId={thread.id} threadNumber={thread.number} />
          <span style={{ flex: 1 }} />
          <BookmarkButton number={thread.number} title={thread.title} board={thread.board} withLabel />
        </div>
      </article>

      {thread.answer && (
        <section aria-label="已採納的解答" className={`card ${styles.answer}`}>
          <div className={styles.answerLabel}>
            <Icon name="checkCircle" />
            提問者採納的解答
          </div>
          <div className="row" style={{ marginBottom: 12 }}>
            <Avatar member={thread.answer.author} size={32} />
            <MemberLink member={thread.answer.author} />
            <span className="muted" style={{ fontSize: 13 }}>
              <RelativeTime iso={thread.answer.createdAt} />
            </span>
          </div>
          <Markdown source={thread.answer.body} />
          <div className="row" style={{ gap: 8, marginTop: 10 }}>
            <span className="react">推 {thread.answer.ups}</span>
          </div>
        </section>
      )}

      <h2 style={{ margin: "8px 0 0", fontSize: 18 }}>{thread.replyCount} 則回覆</h2>
      {shownReplies < thread.replyCount && (
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>
          {dataSource() === "fixtures" ? (
            <>範例資料只收錄了其中 {shownReplies} 則。</>
          ) : (
            <>
              這裡顯示前 {shownReplies} 則，
              {thread.url ? <a href={thread.url}>到 GitHub 看全部回覆</a> : "其餘請到 GitHub 查看"}。
            </>
          )}
        </p>
      )}
      {thread.replies.map((r) => (
        <ReplyItem key={r.id} reply={r} />
      ))}

      <ReplyBox threadNumber={thread.number} discussionId={thread.id} />
    </Columns>
  );
}

export default function ThreadPage(props: PageProps<"/t/[number]">) {
  return (
    <Suspense fallback={<div className="container-narrow page"><FeedSkeleton /></div>}>
      <ThreadView params={props.params} />
    </Suspense>
  );
}
