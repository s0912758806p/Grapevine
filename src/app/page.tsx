import Link from "next/link";
import { Suspense } from "react";
import { FeedSkeleton, PinnedThreads, SortTabs, ThreadList } from "@/components/forum/Feed";
import { HotTags, Leaderboard, NextMeetup, WeeklyCard } from "@/components/forum/Sidebar";
import { Columns } from "@/components/layout/Columns";
import { BOARDS } from "@/lib/boards";
import { parseSort } from "@/lib/forum/query";

async function Feed({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const sort = parseSort((await searchParams).sort);
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
        <div>
          <h1 className="page-title">動態牆</h1>
          <p className="page-sub">所有看板的最新討論，依你選的方式排序。</p>
        </div>
        <SortTabs basePath="/" current={sort} />
      </div>
      <PinnedThreads />
      <ThreadList sort={sort} />
    </>
  );
}

export default function HomePage(props: PageProps<"/">) {
  return (
    <Columns
      aside={
        <>
          <Leaderboard />
          <HotTags />
          <WeeklyCard />
          <NextMeetup />
        </>
      }
    >
      <nav aria-label="看板" className="mobile-only" style={{ overflowX: "auto", margin: "0 -16px", padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 8, width: "max-content" }}>
          {BOARDS.map((b) => (
            <Link key={b.slug} href={`/c/${b.slug}`} className="pill">
              {b.name}
            </Link>
          ))}
        </div>
      </nav>
      <Suspense fallback={<FeedSkeleton />}>
        <Feed searchParams={props.searchParams} />
      </Suspense>
    </Columns>
  );
}
