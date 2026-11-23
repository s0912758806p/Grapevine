/**
 * Right-rail widgets for the feed and board pages: weekly leaderboard, hot
 * tags, weekly reading club and next meetup. Each fetches its own cached data.
 */
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getHotTags, getLeaderboard, listThreads } from "@/lib/forum";
import { levelLabel } from "@/lib/levels";
import { Avatar } from "./bits";
import styles from "./forum.module.css";

export async function Leaderboard() {
  const leaders = await getLeaderboard();
  if (leaders.length === 0) return null;
  return (
    <section className={`card ${styles.widget}`} aria-labelledby="leaders-h">
      <h2 id="leaders-h" className={styles.widgetTitle}>
        <Icon name="flame" className="ico" />
        本週活躍
      </h2>
      <ol className={styles.leaders}>
        {leaders.map((entry, i) => (
          <li key={entry.member.login}>
            <span className={styles.rank}>{i + 1}</span>
            <Avatar member={entry.member} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <Link href={`/u/${entry.member.login}`} style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                {entry.member.name}
              </Link>
              <span className="muted" style={{ fontSize: 12 }}>
                {levelLabel(entry.xp)}
              </span>
            </span>
            <span className="text-2" style={{ fontSize: 13 }}>
              {entry.replies} 則回覆
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export async function HotTags() {
  const tags = await getHotTags();
  if (tags.length === 0) return null;
  return (
    <section className={`card ${styles.widget}`} aria-labelledby="tags-h">
      <h2 id="tags-h" className={styles.widgetTitle}>
        熱門標籤
      </h2>
      <div className="row" style={{ gap: 8 }}>
        {tags.map((tag) => (
          <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`} className="tag" style={{ fontSize: 13, padding: "4px 10px" }}>
            #{tag}
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function WeeklyCard() {
  const [latest] = await listThreads({ board: "weekly", sort: "new", limit: 1 });
  return (
    <section className={`card ${styles.widget} stack`} style={{ gap: 8 }}>
      <span className="chip tone-amber" style={{ alignSelf: "flex-start" }}>
        週刊共讀
      </span>
      <h2 style={{ margin: 0, fontSize: 15 }}>{latest ? latest.title : "科技愛好者週刊"}</h2>
      <p className="text-2" style={{ margin: 0, fontSize: 13 }}>
        每週同步阮一峰的週刊，挑一篇最有感的文章一起聊。
      </p>
      <Link href={latest ? `/t/${latest.number}` : "/c/weekly"} style={{ fontSize: 14, fontWeight: 600 }}>
        前往共讀討論
      </Link>
    </section>
  );
}

export async function NextMeetup() {
  const [next] = await listThreads({ board: "meetups", sort: "new", limit: 1 });
  if (!next?.meetup) return null;
  return (
    <section className={`card ${styles.widget} stack`} style={{ gap: 8 }}>
      <span className="chip tone-sky" style={{ alignSelf: "flex-start" }}>
        在地聚會
      </span>
      <h2 style={{ margin: 0, fontSize: 15 }}>
        <Link href={`/t/${next.number}`} style={{ color: "var(--text)" }}>
          {next.title}
        </Link>
      </h2>
      <p className="text-2 row" style={{ margin: 0, fontSize: 13, gap: 6 }}>
        <Icon name="mapPin" size={16} />
        {next.meetup.city} · {next.meetup.when} · {next.meetup.venue}
      </p>
      <Link href="/meetups" style={{ fontSize: 14, fontWeight: 600 }}>
        查看聚會地圖
      </Link>
    </section>
  );
}

export function BoardRules({ rules }: { rules: string[] }) {
  return (
    <section className={`card ${styles.widget}`} aria-labelledby="rules-h">
      <h2 id="rules-h" className={styles.widgetTitle}>
        看板規則
      </h2>
      <ol className="text-2" style={{ margin: 0, paddingLeft: 20, fontSize: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        {rules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ol>
    </section>
  );
}
