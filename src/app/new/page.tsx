import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Composer, type ComposerBoard } from "@/components/forum/Composer";
import { SignInPrompt } from "@/components/forum/Interactive";
import { Columns } from "@/components/layout/Columns";
import { BOARDS } from "@/lib/boards";
import { dataSource, getBoardStatus } from "@/lib/forum";
import { MEETUP_CITIES } from "@/lib/forum/meta";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "發表主題", robots: { index: false } };

async function ComposerForViewer({ searchParams }: { searchParams: PageProps<"/new">["searchParams"] }) {
  const [sp, status, viewer] = await Promise.all([searchParams, getBoardStatus(), getViewer()]);
  const requested = typeof sp.board === "string" ? sp.board : "";

  if (dataSource() === "github" && !viewer) {
    const returnTo = requested ? `/new?board=${encodeURIComponent(requested)}` : "/new";
    return <SignInPrompt returnTo={returnTo}>發文會以你的 GitHub 帳號發佈到 Discussions，請先登入。</SignInPrompt>;
  }

  const boards: ComposerBoard[] = BOARDS.map((b) => ({
    slug: b.slug,
    name: b.name,
    hint: b.hint,
    kind: b.kind,
    disabledReason: b.maintainersOnly
      ? "僅版主可發"
      : b.kind === "anonymous"
        ? "匿名發文尚未開放"
        : status[b.slug] === false
          ? "分類尚未建立"
          : undefined,
  }));
  const initial = boards.find((b) => b.slug === requested && !b.disabledReason)?.slug ?? boards.find((b) => !b.disabledReason)?.slug ?? "qa";
  return <Composer key={initial} initialBoard={initial} boards={boards} cities={Object.keys(MEETUP_CITIES)} />;
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
        <ComposerForViewer searchParams={props.searchParams} />
      </Suspense>
    </Columns>
  );
}
