import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon, type IconName } from "@/components/Icon";
import { FeedSkeleton, PinnedThreads, SortTabs, ThreadList } from "@/components/forum/Feed";
import { CredibilityVote, RumorBox } from "@/components/forum/Interactive";
import { RelativeTime } from "@/components/forum/RelativeTime";
import { BoardRules, HotTags, Leaderboard } from "@/components/forum/Sidebar";
import { EmptyState } from "@/components/forum/ThreadCard";
import styles from "@/components/forum/forum.module.css";
import { Columns } from "@/components/layout/Columns";
import { BOARDS, getBoard, type Board } from "@/lib/boards";
import { getBoardStatus, listThreads } from "@/lib/forum";
import { parseSort } from "@/lib/forum/query";
import type { Thread } from "@/lib/forum/types";

export function generateStaticParams() {
  return BOARDS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(props: PageProps<"/c/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const board = getBoard(slug);
  if (!board) return {};
  return { title: board.name, description: board.description, alternates: { canonical: `/c/${board.slug}` } };
}

const BOARD_ICON: Record<Board["kind"], IconName> = {
  announcement: "pin",
  discussion: "chat",
  qa: "question",
  mirror: "list",
  anonymous: "eyeOff",
  meetup: "mapPin",
};

type SearchParams = PageProps<"/c/[slug]">["searchParams"];

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

const PLACES = [
  ["", "全部"],
  ["tpe", "台北"],
  ["hsc", "新竹"],
  ["txg", "台中"],
  ["remote", "遠端"],
] as const;
const TYPES = [
  ["", "全部"],
  ["full", "全職"],
  ["part", "兼職"],
  ["contract", "接案"],
] as const;

async function JobList({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const place = first(sp.place) ?? "";
  const type = first(sp.type) ?? "";
  const qs = (p: string, t: string) => {
    const q = new URLSearchParams();
    if (p) q.set("place", p);
    if (t) q.set("type", t);
    const s = q.toString();
    return s ? `/c/jobs?${s}` : "/c/jobs";
  };
  const jobs = (await listThreads({ board: "jobs", sort: "new" })).filter(
    (t) => (!place || t.job?.place === place) && (!type || t.job?.type === type),
  );
  return (
    <>
      <div className="card card-flat card-pad stack" style={{ gap: 12 }}>
        <div className={styles.filterRow} role="group" aria-label="地點">
          <span className={styles.filterLabel}>地點</span>
          {PLACES.map(([id, label]) => (
            <Link key={label} href={qs(id, type)} className="pill" aria-current={place === id ? "true" : undefined} scroll={false}>
              {label}
            </Link>
          ))}
        </div>
        <div className={styles.filterRow} role="group" aria-label="類型">
          <span className={styles.filterLabel}>類型</span>
          {TYPES.map(([id, label]) => (
            <Link key={label} href={qs(place, id)} className="pill" aria-current={type === id ? "true" : undefined} scroll={false}>
              {label}
            </Link>
          ))}
        </div>
      </div>
      <p className="text-2" style={{ margin: "4px 2px 0", fontSize: 14 }} aria-live="polite">
        共 {jobs.length} 個職缺
      </p>
      {jobs.length === 0 ? (
        <EmptyState title="這個條件下暫時沒有職缺" body="換個條件看看，或追蹤這個看板等新職缺。" />
      ) : (
        jobs.map((t) => <JobCard key={t.number} thread={t} />)
      )}
    </>
  );
}

function JobCard({ thread }: { thread: Thread }) {
  const job = thread.job!;
  return (
    <article className={`card ${styles.job}`}>
      <span className={styles.jobMono} aria-hidden="true">
        {String.fromCharCode(65 + (thread.number % 26))}
      </span>
      <div style={{ flex: "1 1 360px", minWidth: 0 }} className="stack">
        <h2 style={{ margin: 0, fontSize: 17 }}>
          <Link href={thread.href ?? `/t/${thread.number}`} style={{ color: "var(--text)" }}>
            {thread.title}
          </Link>
        </h2>
        <div className="row text-2" style={{ gap: 14, fontSize: 13 }}>
          <span>{job.company}</span>
          <span className="row" style={{ gap: 5 }}>
            <Icon name="mapPin" size={15} />
            {job.placeLabel}
          </span>
          <span>{TYPES.find(([id]) => id === job.type)?.[1]}</span>
          <span>薪資 {job.pay}</span>
        </div>
        <div className="row" style={{ gap: 6 }}>
          {thread.tags.map((g) => (
            <span key={g} className="tag">
              #{g}
            </span>
          ))}
        </div>
      </div>
      <div className="stack muted" style={{ alignItems: "flex-end", gap: 6, fontSize: 13 }}>
        <RelativeTime iso={thread.createdAt} />
        <span className="row" style={{ gap: 5 }}>
          <Icon name="chat" size={15} />
          {thread.replyCount} 則提問
        </span>
      </div>
    </article>
  );
}

async function RumorWall() {
  const rumors = await listThreads({ board: "rumors", sort: "new" });
  return (
    <>
      <RumorBox />
      {rumors.length === 0 && <EmptyState title="還沒有八卦" body="匿名發文開放後，這裡會出現大家聽到的消息。" />}
      <div className="grid-2">
        {rumors.map((t) => (
          <article key={t.number} className={`card ${styles.rumor}`}>
            <div className="row muted" style={{ gap: 8, fontSize: 13 }}>
              <span className="avatar tone-rose" style={{ width: 26, height: 26, fontSize: 12 }} aria-hidden="true">
                ?
              </span>
              匿名葡萄 · <RelativeTime iso={t.createdAt} />
            </div>
            <p style={{ margin: 0, fontSize: 15 }}>
              <Link href={`/t/${t.number}`} style={{ color: "var(--text)" }}>
                {t.title}
              </Link>
            </p>
            {t.credibility && (
              <CredibilityVote believe={t.credibility.believe} doubt={t.credibility.doubt} subjectId={t.id} threadNumber={t.number} />
            )}
          </article>
        ))}
      </div>
    </>
  );
}

async function MeetupList() {
  const meetups = await listThreads({ board: "meetups", sort: "new" });
  return (
    <>
      <Link href="/meetups" className="btn" style={{ alignSelf: "flex-start" }}>
        <Icon name="mapPin" />
        在地圖上查看
      </Link>
      {meetups.length === 0 && <EmptyState title="目前沒有聚會" body="在這個看板發文並選擇城市，聚會就會出現在地圖上。" />}
      {meetups.map((t) => (
        <article key={t.number} className="card card-pad stack" style={{ gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--grape)" }}>{t.meetup?.city}</span>
          <h2 style={{ margin: 0, fontSize: 17 }}>
            <Link href={`/t/${t.number}`} style={{ color: "var(--text)" }}>
              {t.title}
            </Link>
          </h2>
          <span className="text-2" style={{ fontSize: 13 }}>
            {t.meetup?.when} · {t.meetup?.venue}
          </span>
          <span className="muted" style={{ fontSize: 13 }}>
            {t.meetup?.going} 人想參加
          </span>
        </article>
      ))}
    </>
  );
}

async function SortedList({ board, searchParams }: { board: Board; searchParams: SearchParams }) {
  const sort = parseSort((await searchParams).sort);
  return (
    <>
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <SortTabs basePath={`/c/${board.slug}`} current={sort} />
      </div>
      <PinnedThreads board={board.slug} />
      <ThreadList board={board.slug} sort={sort} showBoard={false} />
    </>
  );
}

function BoardBody({ board, searchParams }: { board: Board; searchParams: SearchParams }) {
  if (board.slug === "jobs") return <JobList searchParams={searchParams} />;
  if (board.kind === "anonymous") return <RumorWall />;
  if (board.kind === "meetup") return <MeetupList />;
  return <SortedList board={board} searchParams={searchParams} />;
}

async function BoardView({ params, searchParams }: { params: PageProps<"/c/[slug]">["params"]; searchParams: SearchParams }) {
  const { slug } = await params;
  const board = getBoard(slug);
  if (!board) notFound();
  const status = await getBoardStatus();
  const hasCategory = status[board.slug] !== false;
  const cta =
    board.maintainersOnly || board.kind === "anonymous" || !hasCategory
      ? null
      : board.slug === "jobs" && board.mirror
        ? { href: `https://github.com/${board.mirror.owner}/${board.mirror.repo}/issues/new`, label: "到 F2E Jobs 張貼職缺" }
        : { href: `/new?board=${board.slug}`, label: board.kind === "mirror" ? "發起討論" : "在這裡發文" };
  return (
    <>
      <section className={`${styles.boardHero} tone-${board.tone}`}>
        <div className={`container-narrow ${styles.boardHeroInner}`}>
          <span className={styles.boardIcon}>
            <Icon name={BOARD_ICON[board.kind]} size={30} />
          </span>
          <div style={{ flex: "1 1 420px", minWidth: 0 }}>
            <nav aria-label="麵包屑" className="muted" style={{ fontSize: 13 }}>
              <Link href="/">動態牆</Link> / <Link href="/boards">看板</Link>
            </nav>
            <h1 className="page-title" style={{ color: "var(--text)", margin: "2px 0 4px" }}>
              {board.name}
            </h1>
            <p className="text-2" style={{ margin: 0, maxWidth: 640 }}>
              {board.description}
            </p>
          </div>
          {cta && (
            <Link className="btn btn-primary" href={cta.href}>
              {cta.label}
            </Link>
          )}
        </div>
      </section>
      <Columns
        nav={false}
        aside={
          <>
            <BoardRules rules={board.rules} />
            {board.mirror && (
              <section className="card card-pad stack" style={{ gap: 8, fontSize: 14 }}>
                <h2 style={{ margin: 0, fontSize: 15 }}>資料來源</h2>
                <p className="text-2" style={{ margin: 0 }}>
                  內容唯讀同步自 {board.mirror.label}，留言請到 GitHub 原文；想在 Grapevine 聊，可以另外發起討論。
                </p>
                <a href={`https://github.com/${board.mirror.owner}/${board.mirror.repo}`}>查看原始 repo</a>
              </section>
            )}
            <Leaderboard />
            <HotTags />
          </>
        }
      >
        {!hasCategory && (
          <p className="notice tone-amber" style={{ margin: 0 }}>
            <Icon name="info" className="ico-sm" />
            <span>
              這個看板對應的 GitHub Discussions 分類「{board.discussionCategory}」還沒建立，所以暫時不能發文
              {board.mirror ? "；同步過來的內容仍會顯示" : ""}。
            </span>
          </p>
        )}
        <BoardBody board={board} searchParams={searchParams} />
      </Columns>
    </>
  );
}

export default function BoardPage(props: PageProps<"/c/[slug]">) {
  return (
    <Suspense fallback={<div className="container-narrow page"><FeedSkeleton /></div>}>
      <BoardView params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}
