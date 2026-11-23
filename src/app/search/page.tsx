import type { Metadata } from "next";
import { Suspense } from "react";
import { FeedSkeleton } from "@/components/forum/Feed";
import { EmptyState, ThreadCard } from "@/components/forum/ThreadCard";
import { Columns } from "@/components/layout/Columns";
import { listThreads } from "@/lib/forum";

export const metadata: Metadata = { title: "搜尋", robots: { index: false } };

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const tag = typeof sp.tag === "string" ? sp.tag.trim() : "";
  if (!q && !tag) {
    return <EmptyState title="想找什麼？" body="輸入關鍵字，或點任何一個 #標籤 來找相關主題。" />;
  }
  const results = await listThreads({ q: q || undefined, tag: tag || undefined, sort: "new" });
  const label = tag ? `#${tag}` : `「${q}」`;
  return (
    <>
      <p className="text-2" style={{ margin: 0 }} aria-live="polite">
        {label} 共找到 {results.length} 個主題
      </p>
      {results.length === 0 ? (
        <EmptyState title="沒有找到相關主題" body="換個關鍵字，或直接發問。" />
      ) : (
        results.map((t) => <ThreadCard key={t.number} thread={t} />)
      )}
    </>
  );
}

async function SearchForm({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  return (
    <form action="/search" role="search" className="row" style={{ flexWrap: "nowrap" }}>
      <label htmlFor="search-q" className="sr-only">
        關鍵字
      </label>
      <input id="search-q" name="q" type="search" className="field" defaultValue={q} placeholder="搜尋主題、標籤或成員" />
      <button type="submit" className="btn btn-primary">
        搜尋
      </button>
    </form>
  );
}

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <Columns>
      <h1 className="page-title">搜尋</h1>
      <Suspense fallback={null}>
        <SearchForm searchParams={props.searchParams} />
      </Suspense>
      <Suspense fallback={<FeedSkeleton />}>
        <Results searchParams={props.searchParams} />
      </Suspense>
    </Columns>
  );
}
