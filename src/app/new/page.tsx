import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Composer } from "@/components/forum/Composer";
import { Columns } from "@/components/layout/Columns";
import { BOARDS } from "@/lib/boards";

export const metadata: Metadata = { title: "發表主題", robots: { index: false } };

async function ComposerWithBoard({ searchParams }: { searchParams: PageProps<"/new">["searchParams"] }) {
  const requested = (await searchParams).board;
  const slug = typeof requested === "string" && BOARDS.some((b) => b.slug === requested && !b.maintainersOnly) ? requested : "qa";
  return (
    <Composer
      key={slug}
      initialBoard={slug}
      boards={BOARDS.map(({ slug: s, name, hint, kind, maintainersOnly }) => ({ slug: s, name, hint, kind, maintainersOnly }))}
    />
  );
}

export default function NewThreadPage(props: PageProps<"/new">) {
  return (
    <Columns
      nav={false}
      aside={
        <>
          <section className="card card-pad" style={{ fontSize: 14 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 15 }}>好問題的三個要素</h2>
            <ol className="text-2" style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              <li>說明你想達成什麼。</li>
              <li>附上最小重現或錯誤訊息。</li>
              <li>寫下你已經試過的方法。</li>
            </ol>
          </section>
          <section className="card card-pad text-2" style={{ fontSize: 13 }}>
            主題會以你的 GitHub 帳號發佈到 Discussions 對應的分類，之後可以在 GitHub 上編輯。發文前請先
            <Link href="/search">搜尋</Link>有沒有相似的主題。
          </section>
        </>
      }
    >
      <div className="row">
        <Link href="/" className="btn btn-quiet">
          返回
        </Link>
        <h1 className="page-title">發表主題</h1>
      </div>
      <Suspense fallback={null}>
        <ComposerWithBoard searchParams={props.searchParams} />
      </Suspense>
    </Columns>
  );
}
