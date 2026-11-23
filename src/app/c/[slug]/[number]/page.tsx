/**
 * Mirrored item (週刊共讀 from ruanyf/weekly, 職缺 from f2etw/jobs). Read-only:
 * the original issue lives in another repo, so comments happen on GitHub, and
 * members can start a forum discussion about it in the same board.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { Avatar, BoardChip, Markdown } from "@/components/forum/bits";
import { BookmarkButton } from "@/components/forum/BookmarkButton";
import { FeedSkeleton } from "@/components/forum/Feed";
import { RelativeTime } from "@/components/forum/RelativeTime";
import styles from "@/components/forum/forum.module.css";
import { Columns } from "@/components/layout/Columns";
import { BOARDS, getBoard } from "@/lib/boards";
import { getMirrorThread, listThreads } from "@/lib/forum";

export async function generateStaticParams() {
  const params: { slug: string; number: string }[] = [];
  for (const board of BOARDS.filter((b) => b.mirror)) {
    try {
      const items = (await listThreads({ board: board.slug, sort: "new", limit: 10 })).filter((t) => t.external);
      params.push(...items.map((t) => ({ slug: board.slug, number: String(t.number) })));
    } catch (err) {
      console.warn(`Could not list ${board.slug} for prerendering:`, err instanceof Error ? err.message : err);
    }
  }
  // Cache Components needs at least one entry; the placeholder renders "not found".
  return params.length > 0 ? params : [{ slug: "weekly", number: "1" }];
}

async function load(params: PageProps<"/c/[slug]/[number]">["params"]) {
  const { slug, number } = await params;
  const n = Number(number);
  if (!getBoard(slug)?.mirror || !Number.isInteger(n) || n <= 0) return null;
  return getMirrorThread(slug, n);
}

export async function generateMetadata(props: PageProps<"/c/[slug]/[number]">): Promise<Metadata> {
  const item = await load(props.params);
  if (!item) return {};
  return { title: item.title, description: item.excerpt, alternates: { canonical: item.href } };
}

async function MirrorView({ params }: { params: PageProps<"/c/[slug]/[number]">["params"] }) {
  const item = await load(params);
  if (!item) notFound();
  const board = getBoard(item.board)!;
  return (
    <Columns
      nav={false}
      aside={
        <section className={`card ${styles.widget} stack`} style={{ gap: 10, fontSize: 14 }}>
          <h2 style={{ margin: 0, fontSize: 15 }}>來源</h2>
          <p className="text-2" style={{ margin: 0 }}>
            這篇同步自 {board.mirror!.label}，內容唯讀。留言請到 GitHub 原文，或在 Grapevine 開一個討論。
          </p>
          {item.url && (
            <a className="btn" href={item.url}>
              <Icon name="github" />
              在 GitHub 留言（{item.replyCount}）
            </a>
          )}
          <Link className="btn btn-primary" href={`/new?board=general`}>
            在 Grapevine 討論這篇
          </Link>
          <BookmarkButton number={item.number} href={item.href} title={item.title} board={item.board} withLabel />
        </section>
      }
    >
      <nav aria-label="麵包屑" className="muted row" style={{ fontSize: 14, gap: 8 }}>
        <Link href="/">動態牆</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/c/${board.slug}`}>{board.name}</Link>
      </nav>
      <div className="row" style={{ gap: 8 }}>
        <BoardChip slug={board.slug} link />
        {item.tags.map((g) => (
          <span key={g} className="tag">
            #{g}
          </span>
        ))}
      </div>
      <h1 className="page-title">{item.title}</h1>
      <article className={`card ${styles.post}`}>
        <div className={styles.postHead}>
          <Avatar member={item.author} size={32} />
          <span style={{ fontWeight: 700 }}>{item.author.name}</span>
          <span className="muted" style={{ fontSize: 13 }}>
            <RelativeTime iso={item.createdAt} prefix="發表於 " />
          </span>
        </div>
        {item.job && (
          <dl className="row text-2" style={{ gap: 18, fontSize: 14, margin: "0 0 12px" }}>
            <div><dt className="muted" style={{ display: "inline" }}>公司 </dt><dd style={{ display: "inline", margin: 0 }}>{item.job.company}</dd></div>
            <div><dt className="muted" style={{ display: "inline" }}>地點 </dt><dd style={{ display: "inline", margin: 0 }}>{item.job.placeLabel}</dd></div>
            <div><dt className="muted" style={{ display: "inline" }}>薪資 </dt><dd style={{ display: "inline", margin: 0 }}>{item.job.pay}</dd></div>
          </dl>
        )}
        <Markdown source={item.body || "_（原文沒有內文）_"} />
      </article>
    </Columns>
  );
}

export default function MirrorPage(props: PageProps<"/c/[slug]/[number]">) {
  return (
    <Suspense fallback={<div className="container-narrow page"><FeedSkeleton /></div>}>
      <MirrorView params={props.params} />
    </Suspense>
  );
}
