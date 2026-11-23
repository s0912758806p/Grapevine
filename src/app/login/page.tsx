import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/actions";
import { Icon } from "@/components/Icon";
import { Avatar } from "@/components/forum/bits";
import { Columns } from "@/components/layout/Columns";
import { githubApp, missingSignInEnv } from "@/lib/config";
import { safeReturnTo } from "@/lib/github/return-to";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = { title: "登入", robots: { index: false } };

const ERRORS: Record<string, string> = {
  denied: "你取消了 GitHub 授權，所以沒有登入。",
  state: "登入驗證失敗（可能是登入頁開太久），請再試一次。",
  github: "GitHub 暫時沒有回應，請稍後再試。",
  "not-configured": "網站還沒有設定 GitHub 登入。",
};

/**
 * Sign-in page. Starts the GitHub App flow (/api/auth/login), shows errors from
 * the callback, and lets a signed-in member see who they are or sign out.
 */
async function LoginPanel({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const [sp, viewer] = await Promise.all([searchParams, getViewer()]);
  const error = typeof sp.error === "string" ? ERRORS[sp.error] : undefined;
  const returnTo = safeReturnTo(typeof sp.returnTo === "string" ? sp.returnTo : undefined);
  const configured = githubApp() !== null;

  if (viewer) {
    return (
      <>
        <div className="row">
          <Avatar member={viewer} size={48} />
          <div>
            <strong>{viewer.name}</strong>
            <div className="muted">@{viewer.login}</div>
          </div>
        </div>
        <div className="row">
          <Link className="btn btn-primary" href={`/u/${viewer.login}`}>
            我的個人頁
          </Link>
          <form action={signOut}>
            <button type="submit" className="btn">
              登出
            </button>
          </form>
        </div>
      </>
    );
  }

  return (
    <>
      {error && (
        <p className="notice tone-amber" style={{ margin: 0 }} role="alert">
          <Icon name="info" className="ico-sm" />
          <span>{error}</span>
        </p>
      )}
      {configured ? (
        <a className="btn btn-primary" href={`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`}>
          <Icon name="github" />
          以 GitHub 繼續
        </a>
      ) : (
        <>
          <p className="notice tone-amber" style={{ margin: 0 }}>
            <Icon name="info" className="ico-sm" />
            <span>
              這個網站還沒有設定 GitHub 登入，所以暫時只能瀏覽；收藏會存在這台裝置上。
              {process.env.NODE_ENV !== "production" && (
                <>
                  {" "}
                  （站長請在 <code>.env.local</code> 補上：{missingSignInEnv().join("、")}，步驟見 DEPLOY.md）
                </>
              )}
            </span>
          </p>
          <button type="button" className="btn btn-primary" disabled>
            <Icon name="github" />
            以 GitHub 繼續
          </button>
        </>
      )}
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>
        Grapevine 只會取得 Discussions 的讀寫權限，而且只限論壇所在的 repo；不會碰你的其他 repo 或程式碼。
      </p>
    </>
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <Columns nav={false}>
      <section className="card card-pad stack" style={{ maxWidth: 520, gap: 14, padding: 28 }}>
        <h1 className="page-title">用 GitHub 登入</h1>
        <p className="text-2" style={{ margin: 0 }}>
          登入後就能發文、回覆、按反應和投票。內容存在 GitHub Discussions，你隨時看得到原始紀錄。
        </p>
        <Suspense fallback={null}>
          <LoginPanel searchParams={props.searchParams} />
        </Suspense>
        <Link href="/">先逛逛動態牆</Link>
      </section>
    </Columns>
  );
}
