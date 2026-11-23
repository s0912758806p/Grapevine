import type { Metadata } from "next";
import Link from "next/link";
import { MeetupMapLoader } from "@/components/forum/MeetupMapLoader";
import { Columns } from "@/components/layout/Columns";
import { listThreads } from "@/lib/forum";

export const metadata: Metadata = {
  title: "聚會地圖",
  description: "台灣各地的前端讀書會、技術聚會與工作坊。",
};

export default async function MeetupsPage() {
  const meetups = (await listThreads({ board: "meetups", sort: "new" })).filter((t) => t.meetup);
  const pins = meetups.map((t) => ({
    number: t.number,
    title: t.title,
    city: t.meetup!.city,
    when: t.meetup!.when,
    lat: t.meetup!.lat,
    lng: t.meetup!.lng,
  }));
  return (
    <Columns>
      <div>
        <span className="chip tone-sky">在地聚會看板</span>
        <h1 className="page-title" style={{ marginTop: 8 }}>
          附近的聚會
        </h1>
        <p className="page-sub">讀書會、技術聚會與工作坊。想辦聚會？到「在地聚會」看板發文，附上城市與時間。</p>
      </div>
      <div className="card" style={{ height: 420, overflow: "hidden", padding: 0 }}>
        <MeetupMapLoader pins={pins} />
      </div>
      <ul className="grid-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {meetups.map((t) => (
          <li key={t.number} className="card card-pad stack" style={{ gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--grape)" }}>{t.meetup!.city}</span>
            <Link href={`/t/${t.number}`} style={{ fontWeight: 700, color: "var(--text)", fontSize: 16 }}>
              {t.title}
            </Link>
            <span className="text-2" style={{ fontSize: 13 }}>
              {t.meetup!.when} · {t.meetup!.venue}
            </span>
            <span className="muted" style={{ fontSize: 13 }}>
              {t.meetup!.going} 人報名
            </span>
          </li>
        ))}
      </ul>
    </Columns>
  );
}
