"use client";

import { Icon } from "@/components/Icon";
import { bookmarkHref, toggleBookmark, useBookmarks } from "@/lib/bookmarks";

export function BookmarkButton({
  number,
  href,
  title,
  board,
  withLabel = false,
}: {
  number: number;
  href?: string;
  title: string;
  board: string;
  withLabel?: boolean;
}) {
  const key = bookmarkHref({ number, href });
  const saved = useBookmarks().some((b) => bookmarkHref(b) === key);
  return (
    <button
      type="button"
      className={withLabel ? "btn btn-quiet" : "icon-btn"}
      style={withLabel ? undefined : { width: 36, height: 36, color: saved ? "var(--grape)" : undefined }}
      aria-pressed={saved}
      aria-label={withLabel ? undefined : saved ? "取消收藏" : "收藏"}
      onClick={() => toggleBookmark({ number, href, title, board })}
    >
      <Icon name="bookmark" size={16} />
      {withLabel && (saved ? "已收藏" : "收藏")}
    </button>
  );
}
