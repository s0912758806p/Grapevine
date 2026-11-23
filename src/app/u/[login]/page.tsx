import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/forum/bits";
import { FeedSkeleton } from "@/components/forum/Feed";
import { EmptyState, ThreadCard } from "@/components/forum/ThreadCard";
import styles from "@/components/forum/forum.module.css";
import { Columns } from "@/components/layout/Columns";
import { getLeaderboard, getProfile } from "@/lib/forum";
import { upCount } from "@/lib/forum/query";
import { badgesFor, levelFor, xpFromStats } from "@/lib/levels";

export async function generateStaticParams() {
  const leaders = await getLeaderboard();
  return leaders.map((l) => ({ login: l.member.login }));
}

export async function generateMetadata(props: PageProps<"/u/[login]">): Promise<Metadata> {
  const { login } = await props.params;
  const profile = await getProfile(login);
  if (!profile) return {};
  return { title: `${profile.member.name}（@${profile.member.login}）`, description: profile.member.bio };
}

const HEAT = ["var(--hm0)", "var(--hm1)", "var(--hm2)", "var(--hm3)", "var(--hm4)"];
const heatLevel = (n: number) => (n === 0 ? 0 : n <= 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4);

async function ProfileView({ params }: { params: PageProps<"/u/[login]">["params"] }) {
  const { login } = await params;
  const profile = await getProfile(decodeURIComponent(login));
  if (!profile) notFound();
  const { member, stats } = profile;
  const level = levelFor(xpFromStats(stats));
  const topUps = Math.max(0, ...profile.threads.map((t) => upCount(t.reactions)));
  const badges = badgesFor(stats, topUps);
  const statItems = [
    { label: "發表主題", value: stats.threads },
    { label: "回覆", value: stats.replies },
    { label: "被採納的解答", value: stats.accepted },
    { label: "收到的推", value: stats.upsReceived },
  ];

  return (
    <Columns nav={false}>
      <section className="card card-pad row" style={{ gap: 24, padding: 24 }}>
        <Avatar member={member} size={96} />
        <div style={{ flex: "1 1 320px", minWidth: 0 }} className="stack">
          <div className="row">
            <h1 className="page-title">{member.name}</h1>
            <span className="muted">@{member.login}</span>
            <span className="chip tone-grape">
              Lv.{level.level} {level.title}
            </span>
          </div>
          {member.bio && (
            <p className="text-2" style={{ margin: 0 }}>
              {member.bio}
            </p>
          )}
          <div style={{ maxWidth: 420 }}>
            <div className="row text-2" style={{ justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span>{level.next ? `距離 Lv.${level.next.level} ${level.next.title}` : "已達最高等級"}</span>
              <span>{level.next ? `還差 ${level.next.remaining} 點` : `${level.xp} 點`}</span>
            </div>
            <div className={styles.progress} role="progressbar" aria-label="等級進度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={level.progress}>
              <div className={styles.progressFill} style={{ width: `${level.progress}%` }} />
            </div>
          </div>
        </div>
        <a className="btn" href={`https://github.com/${member.login}`}>
          <Icon name="github" />
          GitHub 個人頁
        </a>
      </section>

      <div className="grid-4">
        {statItems.map((s) => (
          <div key={s.label} className="card card-pad">
            <div className="muted" style={{ fontSize: 13 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="cols" style={{ gap: 20 }}>
        <div className="col-main" style={{ gap: 20 }}>
          <section className="card card-pad">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 15 }}>近半年的參與</h2>
              <span className="muted row" style={{ fontSize: 12, gap: 4 }} aria-hidden="true">
                少
                {HEAT.map((c) => (
                  <span key={c} className={styles.cell} style={{ background: c }} />
                ))}
                多
              </span>
            </div>
            <div role="img" aria-label="近 26 週每日發文與回覆次數的熱度圖" style={{ overflowX: "auto" }}>
              <div className={styles.heatmap}>
                {profile.activity.map((n, i) => (
                  <span key={i} className={styles.cell} style={{ background: HEAT[heatLevel(n)] }} />
                ))}
              </div>
            </div>
          </section>
          <section className="stack">
            <h2 style={{ margin: 0, fontSize: 18 }}>發表的主題</h2>
            {profile.threads.length === 0 ? (
              <EmptyState title="還沒有發表主題" body="參與討論、回覆別人也會累積經驗值。" />
            ) : (
              profile.threads.map((t) => <ThreadCard key={t.number} thread={t} />)
            )}
          </section>
        </div>
        <section className={`card ${styles.widget} col-aside`} style={{ display: "block" }} aria-labelledby="badges-h">
          <h2 id="badges-h" style={{ margin: "0 0 4px", fontSize: 15 }}>
            徽章
          </h2>
          <p className="muted" style={{ margin: "0 0 14px", fontSize: 13 }}>
            依論壇上的真實活動計算。
          </p>
          <ul className="grid-2" style={{ listStyle: "none", margin: 0, padding: 0, gap: 10 }}>
            {badges.map((b) => (
              <li key={b.id} className={`${styles.badge} ${b.earned ? "" : styles.badgeLocked}`}>
                <span className={styles.badgeIcon}>
                  <Icon name="star" />
                </span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{b.name}</span>
                <span className="text-2" style={{ fontSize: 12 }}>
                  {b.description}
                </span>
                <span className="sr-only">{b.earned ? "已獲得" : "尚未獲得"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Columns>
  );
}

export default function ProfilePage(props: PageProps<"/u/[login]">) {
  return (
    <Suspense fallback={<div className="container-narrow page"><FeedSkeleton /></div>}>
      <ProfileView params={props.params} />
    </Suspense>
  );
}
