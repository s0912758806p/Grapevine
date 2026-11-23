"use client";

import Link from "next/link";
import { removeBookmark, useBookmarks } from "@/lib/bookmarks";
import { getBoard } from "@/lib/boards";
import { RelativeTime } from "./RelativeTime";

export function BookmarkList() {
  const bookmarks = useBookmarks();
  if (bookmarks.length === 0) {
    return (
      <div className="card empty">
        <strong>還沒有收藏</strong>
        <span style={{ fontSize: 14 }}>
          在主題卡片或主題頁按「收藏」，就會出現在這裡。<Link href="/">回到動態牆</Link>
        </span>
      </div>
    );
  }
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }} className="stack">
      {bookmarks.map((b) => {
        const board = getBoard(b.board);
        return (
          <li key={b.number} className="card card-pad row" style={{ flexWrap: "nowrap" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {board && <span className={`chip tone-${board.tone}`}>{board.name}</span>}
              <Link href={`/t/${b.number}`} style={{ display: "block", fontWeight: 700, color: "var(--text)", marginTop: 6 }}>
                {b.title}
              </Link>
              <span className="muted" style={{ fontSize: 13 }}>
                <RelativeTime iso={b.savedAt} prefix="收藏於 " />
              </span>
            </div>
            <button type="button" className="btn btn-quiet" onClick={() => removeBookmark(b.number)}>
              移除
            </button>
          </li>
        );
      })}
    </ul>
  );
}
