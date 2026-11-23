/**
 * App shell pieces rendered by app/layout.tsx: top bar (with the signed-in
 * member, streamed behind <Suspense> because it reads the session cookie),
 * data-source banner and footer. Path-aware navigation lives in Nav.tsx.
 */
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/actions";
import { Icon, Logo } from "@/components/Icon";
import { Avatar } from "@/components/forum/bits";
import { dataSource, forumRepoUrl } from "@/lib/forum";
import { getViewer } from "@/lib/session";
import styles from "./layout.module.css";
import { SearchBox } from "./SearchBox";
import { ThemeToggle } from "./ThemeToggle";

function SignInLink() {
  return (
    <Link href="/login" className={`btn ${styles.hideMobile}`}>
      <Icon name="github" />
      登入
    </Link>
  );
}

async function UserMenu() {
  const viewer = await getViewer();
  if (!viewer) return <SignInLink />;
  return (
    <details className={styles.userMenu}>
      <summary aria-label={`${viewer.name} 的選單`}>
        <Avatar member={viewer} size={34} />
      </summary>
      <div className={`card ${styles.menuPanel}`}>
        <div className="muted" style={{ fontSize: 13, padding: "4px 10px 8px" }}>
          以 <strong style={{ color: "var(--text)" }}>@{viewer.login}</strong> 登入
        </div>
        <Link href={`/u/${viewer.login}`} className={styles.menuItem}>
          <Icon name="user" />
          我的個人頁
        </Link>
        <Link href="/bookmarks" className={styles.menuItem}>
          <Icon name="bookmark" />
          我的收藏
        </Link>
        <form action={signOut}>
          <button type="submit" className={styles.menuItem}>
            <Icon name="back" />
            登出
          </button>
        </form>
      </div>
    </details>
  );
}

export function TopBar() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <Link href="/" className={styles.brand} aria-label="Grapevine 首頁">
          <Logo />
          <span>Grapevine</span>
        </Link>
        <div className={styles.search}>
          <SearchBox />
        </div>
        <div className={styles.actions}>
          <Link href="/search" className="icon-btn mobile-only" aria-label="搜尋">
            <Icon name="search" />
          </Link>
          <ThemeToggle />
          <Link href="/new" className={`btn btn-primary ${styles.hideMobile}`}>
            <Icon name="plus" />
            發表主題
          </Link>
          <Suspense fallback={<SignInLink />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export function DataBanner() {
  if (dataSource() !== "fixtures") return null;
  return (
    <div className={styles.banner} role="note">
      <div className={`container ${styles.bannerInner}`}>
        <Icon name="info" className="ico-sm" />
        <span>目前顯示的是範例資料，尚未連接 GitHub Discussions。發文、回覆和投票暫時不會儲存。</span>
      </div>
    </div>
  );
}

export function Footer() {
  const repo = forumRepoUrl();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        <span>Grapevine · 建立在 GitHub Discussions 上的開發者論壇</span>
        <nav aria-label="頁尾連結" className="row">
          <Link href="/c/announcements">公告與版規</Link>
          <Link href="/stats">論壇數據</Link>
          {repo && <a href={`${repo}/discussions`}>在 GitHub 上看討論</a>}
          <a href="https://github.com/s0912758806p/Grapevine">原始碼</a>
        </nav>
      </div>
    </footer>
  );
}
