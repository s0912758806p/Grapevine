/**
 * Formatting helpers. All output is zh-TW in the Asia/Taipei time zone so the
 * server render and the browser agree (no hydration mismatch).
 */

const relative = new Intl.RelativeTimeFormat("zh-TW", { numeric: "auto" });
const TAIPEI_OFFSET_MS = 8 * 3_600_000; // Taiwan has no DST.
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "11/23 14:00" in Taipei time. Built by hand rather than with Intl because
 * Node's and browsers' ICU data differ in invisible spacing characters, which
 * breaks hydration.
 */
export function formatAbsolute(iso: string): string {
  const d = new Date(Date.parse(iso) + TAIPEI_OFFSET_MS);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function formatRelative(iso: string, now: number): string {
  const diffSec = Math.round((Date.parse(iso) - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return "剛剛";
  if (abs < 3600) return relative.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return relative.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 30) return relative.format(Math.round(diffSec / 86400), "day");
  if (abs < 86400 * 365) return relative.format(Math.round(diffSec / (86400 * 30)), "month");
  return relative.format(Math.round(diffSec / (86400 * 365)), "year");
}

const AVATAR_COLORS = ["#5e2a69", "#1e5631", "#1d4d78", "#7a4f00", "#8e2846", "#0f5e5a"];

/** Stable avatar background for a login; all colours pass 4.5:1 with white text. */
export function avatarColor(login: string): string {
  const sum = [...login].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

export function initialOf(name: string): string {
  return [...name.trim()][0]?.toUpperCase() ?? "?";
}
