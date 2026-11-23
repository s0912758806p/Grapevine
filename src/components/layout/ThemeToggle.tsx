"use client";

/**
 * Light/dark switch. The initial theme is applied before paint by the inline
 * script in app/layout.tsx (localStorage "theme", else the OS preference);
 * this button flips the `data-theme` attribute and persists the choice.
 */
import { useSyncExternalStore } from "react";
import { Icon } from "@/components/Icon";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "light" || attr === "dark") return attr;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", cb);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme>(subscribe, currentTheme, () => "light");
  const next: Theme = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be unavailable (private mode); the attribute still applies.
    }
    listeners.forEach((cb) => cb());
  }

  return (
    <button
      className="icon-btn"
      type="button"
      onClick={toggle}
      aria-label={next === "dark" ? "切換為深色模式" : "切換為淺色模式"}
      suppressHydrationWarning
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} />
    </button>
  );
}
