import type { Metadata } from "next";
import styles from "@/components/forum/forum.module.css";
import { Columns } from "@/components/layout/Columns";
import { getBoard } from "@/lib/boards";
import { dataSource, getStats } from "@/lib/forum";

export const metadata: Metadata = { title: "論壇數據", description: "Grapevine 每週新主題、回覆與問答解決率。" };

export default async function StatsPage() {
  const stats = await getStats();
  const maxDaily = Math.max(1, ...stats.daily);
  const maxBoard = Math.max(1, ...stats.repliesByBoard.map((b) => b.count));
  const kpis = [
    { label: "本週新主題", value: String(stats.threadsThisWeek) },
    { label: "本週回覆", value: String(stats.repliesThisWeek) },
    { label: "首次回覆中位數", value: `${stats.medianFirstReplyHours} 小時` },
    { label: "問答解決率", value: `${Math.round(stats.qaSolvedRate * 100)}%` },
  ];
  return (
    <Columns>
      <div>
        <span className="chip tone-grape">論壇數據</span>
        <h1 className="page-title" style={{ marginTop: 8 }}>
          社群脈動
        </h1>
        <p className="page-sub">
          數字直接來自論壇資料，不做估算。{dataSource() === "fixtures" && "目前顯示的是範例資料。"}
        </p>
      </div>
      <div className="grid-4">
        {kpis.map((k) => (
          <div key={k.label} className="card card-pad">
            <div className="muted" style={{ fontSize: 13 }}>
              {k.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.3 }}>{k.value}</div>
          </div>
        ))}
      </div>
      <figure className="card card-pad" style={{ margin: 0 }}>
        <figcaption style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>近 14 天每日新主題</figcaption>
        <div className={styles.bars} role="img" aria-label={`近 14 天每日新主題數：${stats.daily.join("、")}`}>
          {stats.daily.map((n, i) => (
            <span key={i} className={styles.bar} style={{ height: `${(n / maxDaily) * 100}%` }} title={`${n} 個主題`} />
          ))}
        </div>
        <div className="row muted" style={{ justifyContent: "space-between", fontSize: 12, marginTop: 6 }}>
          <span>14 天前</span>
          <span>今天</span>
        </div>
      </figure>
      <figure className="card card-pad" style={{ margin: 0 }}>
        <figcaption style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>各看板本週回覆</figcaption>
        <div className="stack" style={{ gap: 10 }}>
          {stats.repliesByBoard.map((b) => (
            <div key={b.board} className={styles.hbar}>
              <span className="text-2">{getBoard(b.board)?.name ?? b.board}</span>
              <span className={styles.progress} aria-hidden="true">
                <span className={styles.progressFill} style={{ display: "block", width: `${(b.count / maxBoard) * 100}%` }} />
              </span>
              <span style={{ textAlign: "right", fontWeight: 600 }}>{b.count}</span>
            </div>
          ))}
        </div>
      </figure>
    </Columns>
  );
}
