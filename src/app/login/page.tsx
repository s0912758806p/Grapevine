import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { Columns } from "@/components/layout/Columns";

export const metadata: Metadata = { title: "登入", robots: { index: false } };

/**
 * Sign-in landing. GitHub OAuth (Route Handlers under /api/auth) ships with the
 * GitHub Discussions adapter; until then this page explains why sign-in is off.
 */
export default function LoginPage() {
  return (
    <Columns nav={false}>
      <section className="card card-pad stack" style={{ maxWidth: 520, gap: 14, padding: 28 }}>
        <h1 className="page-title">用 GitHub 登入</h1>
        <p className="text-2" style={{ margin: 0 }}>
          登入後就能發文、回覆、按反應和投票。內容存在 GitHub Discussions，你隨時看得到原始紀錄。
        </p>
        <p className="notice tone-amber" style={{ margin: 0 }}>
          <Icon name="info" className="ico-sm" />
          <span>GitHub 登入還沒有開放。目前可以瀏覽範例內容，收藏會存在這台裝置上。</span>
        </p>
        <button type="button" className="btn btn-primary" disabled>
          <Icon name="github" />
          以 GitHub 繼續
        </button>
        <Link href="/">先逛逛動態牆</Link>
      </section>
    </Columns>
  );
}
