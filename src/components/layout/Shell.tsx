/**
 * App shell pieces rendered by app/layout.tsx: top bar, data-source banner and
 * footer. Navigation that needs the current path lives in Nav.tsx (client).
 */
import Link from "next/link";
import { Icon, Logo } from "@/components/Icon";
import { dataSource } from "@/lib/forum";
import styles from "./layout.module.css";
import { SearchBox } from "./SearchBox";
import { ThemeToggle } from "./ThemeToggle";

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
          <Link href="/login" className={`btn ${styles.hideMobile}`}>
            <Icon name="github" />
            登入
          </Link>
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
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        <span>Grapevine · 建立在 GitHub Discussions 上的開發者論壇</span>
        <nav aria-label="頁尾連結" className="row">
          <Link href="/t/1">版規</Link>
          <Link href="/stats">論壇數據</Link>
          <a href="https://github.com/s0912758806p/Grapevine">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
