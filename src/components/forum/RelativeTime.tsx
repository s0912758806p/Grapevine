"use client";

/**
 * Renders a timestamp as an absolute zh-TW date on the server (deterministic,
 * cacheable) and upgrades it to relative text ("2 小時前") in the browser.
 */
import { useSyncExternalStore } from "react";
import { formatAbsolute, formatRelative } from "@/lib/format";

const noop = () => () => {};

export function RelativeTime({ iso, prefix = "" }: { iso: string; prefix?: string }) {
  const absolute = formatAbsolute(iso);
  const text = useSyncExternalStore(
    noop,
    () => formatRelative(iso, Date.now()),
    () => absolute,
  );
  return (
    <time dateTime={iso} title={absolute}>
      {prefix}
      {text}
    </time>
  );
}
