"use client";

/**
 * Path-aware navigation: the desktop side nav (boards list) and the mobile
 * bottom tab bar. Both highlight the current section via aria-current.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/Icon";
import { BOARDS } from "@/lib/boards";
import styles from "./layout.module.css";

const TONE_DOT: Record<string, string> = {
  grape: "var(--grape)",
  neutral: "var(--muted)",
  sky: "var(--sky)",
  vine: "var(--vine)",
  amber: "var(--amber)",
  teal: "var(--teal)",
  rose: "var(--rose)",
};

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

const PRIMARY: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "動態牆", icon: "home" },
  { href: "/bookmarks", label: "我的收藏", icon: "bookmark" },
  { href: "/meetups", label: "聚會地圖", icon: "mapPin" },
  { href: "/stats", label: "論壇數據", icon: "chart" },
];

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="主選單" className={styles.nav}>
      {PRIMARY.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={styles.navLink}
          aria-current={isActive(pathname, item.href) ? "page" : undefined}
        >
          <Icon name={item.icon} />
          {item.label}
        </Link>
      ))}
      <p className="sec-label" style={{ margin: "20px 12px 6px" }}>
        看板
      </p>
      {BOARDS.map((b) => {
        const href = `/c/${b.slug}`;
        return (
          <Link key={b.slug} href={href} className={styles.navLink} aria-current={isActive(pathname, href) ? "page" : undefined}>
            <span className="dot" style={{ background: TONE_DOT[b.tone] }} />
            {b.name}
          </Link>
        );
      })}
    </nav>
  );
}

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "首頁", icon: "home" },
  { href: "/boards", label: "看板", icon: "grid" },
];
const TABS_RIGHT: { href: string; label: string; icon: IconName }[] = [
  { href: "/bookmarks", label: "收藏", icon: "bookmark" },
  { href: "/login", label: "我", icon: "user" },
];

export function BottomNav() {
  const pathname = usePathname();
  const tab = (t: (typeof TABS)[number]) => (
    <Link key={t.href} href={t.href} className={styles.tabBtn} aria-current={isActive(pathname, t.href) ? "page" : undefined}>
      <Icon name={t.icon} size={22} />
      {t.label}
    </Link>
  );
  return (
    <nav aria-label="主要分頁" className={styles.bottomNav}>
      {TABS.map(tab)}
      <Link href="/new" className={styles.fab} aria-label="發表主題">
        <Icon name="plus" size={26} />
      </Link>
      {TABS_RIGHT.map(tab)}
    </nav>
  );
}
