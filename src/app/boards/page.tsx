import type { Metadata } from "next";
import Link from "next/link";
import { Columns } from "@/components/layout/Columns";
import { BOARDS } from "@/lib/boards";

export const metadata: Metadata = { title: "所有看板", description: "Grapevine 的所有看板：技術問答、作者專欄、週刊共讀、職缺、八卦牆與在地聚會。" };

export default function BoardsPage() {
  return (
    <Columns>
      <h1 className="page-title">所有看板</h1>
      <ul className="grid-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {BOARDS.map((b) => (
          <li key={b.slug} className="card card-pad stack" style={{ gap: 6 }}>
            <span className={`chip tone-${b.tone}`} style={{ alignSelf: "flex-start" }}>
              {b.hint}
            </span>
            <Link href={`/c/${b.slug}`} style={{ fontWeight: 700, fontSize: 17, color: "var(--text)" }}>
              {b.name}
            </Link>
            <p className="text-2" style={{ margin: 0, fontSize: 14 }}>
              {b.description}
            </p>
          </li>
        ))}
      </ul>
    </Columns>
  );
}
