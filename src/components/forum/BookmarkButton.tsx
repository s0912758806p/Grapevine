"use client";

import { Icon } from "@/components/Icon";
import { toggleBookmark, useBookmarks } from "@/lib/bookmarks";

export function BookmarkButton({
  number,
  title,
  board,
  withLabel = false,
}: {
  number: number;
  title: string;
  board: string;
  withLabel?: boolean;
}) {
  const saved = useBookmarks().some((b) => b.number === number);
  return (
    <button
      type="button"
      className={withLabel ? "btn btn-quiet" : "icon-btn"}
      style={withLabel ? undefined : { width: 36, height: 36, color: saved ? "var(--grape)" : undefined }}
      aria-pressed={saved}
      aria-label={withLabel ? undefined : saved ? "取消收藏" : "收藏"}
      onClick={() => toggleBookmark({ number, title, board })}
    >
      <Icon name="bookmark" size={16} />
      {withLabel && (saved ? "已收藏" : "收藏")}
    </button>
  );
}
