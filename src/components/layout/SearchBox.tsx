"use client";

/**
 * Header search field. Submits a plain GET form to /search (works without JS);
 * ⌘K / Ctrl+K focuses it from anywhere.
 */
import { useEffect, useRef } from "react";
import { Icon } from "@/components/Icon";

export function SearchBox() {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <form action="/search" role="search" className="searchbox">
      <Icon name="search" />
      <label htmlFor="site-search" className="sr-only">
        搜尋論壇
      </label>
      <input ref={ref} id="site-search" name="q" type="search" placeholder="搜尋主題、標籤或成員" autoComplete="off" />
      <kbd aria-hidden="true">⌘K</kbd>
    </form>
  );
}
