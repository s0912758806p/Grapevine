"use client";

/**
 * Local bookmarks ("本機收藏"): stored in this browser's localStorage only,
 * never synced. Exposed as a tiny external store for useSyncExternalStore.
 */
import { useSyncExternalStore } from "react";

export interface Bookmark {
  number: number;
  title: string;
  board: string;
  savedAt: string;
}

const KEY = "grapevine:bookmarks";
const EMPTY: Bookmark[] = [];
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: Bookmark[] } = { raw: null, value: EMPTY };

function read(): Bookmark[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.value;
  let value: Bookmark[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) value = parsed as Bookmark[];
  } catch {
    value = EMPTY;
  }
  cache = { raw, value };
  return value;
}

function write(list: Bookmark[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable: bookmarks simply don't persist.
  }
  listeners.forEach((cb) => cb());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useBookmarks(): Bookmark[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function toggleBookmark(item: Omit<Bookmark, "savedAt">) {
  const list = read();
  const exists = list.some((b) => b.number === item.number);
  write(exists ? list.filter((b) => b.number !== item.number) : [{ ...item, savedAt: new Date().toISOString() }, ...list]);
}

export function removeBookmark(number: number) {
  write(read().filter((b) => b.number !== number));
}
