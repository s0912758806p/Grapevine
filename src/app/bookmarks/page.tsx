import type { Metadata } from "next";
import { BookmarkList } from "@/components/forum/BookmarkList";
import { Columns } from "@/components/layout/Columns";

export const metadata: Metadata = { title: "我的收藏", robots: { index: false } };

export default function BookmarksPage() {
  return (
    <Columns>
      <div>
        <h1 className="page-title">我的收藏</h1>
        <p className="page-sub">收藏只存在這台裝置的瀏覽器裡，不會同步到其他裝置。</p>
      </div>
      <BookmarkList />
    </Columns>
  );
}
