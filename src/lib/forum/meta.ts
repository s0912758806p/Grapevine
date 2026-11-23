/**
 * Grapevine stores forum-only fields (tags, meetup details) inside the
 * Discussion body as a trailing HTML comment, invisible on GitHub:
 *
 *   <!-- grapevine {"tags":["react"],"meetup":{"city":"台北",...}} -->
 *
 * Members can't apply repository labels (that needs triage access), so this
 * keeps tags working for everyone without extra permissions.
 */

export interface ThreadMeta {
  tags?: string[];
  meetup?: { city: string; when: string; venue: string };
}

const META_RE = /\n*<!--\s*grapevine\s+(\{[\s\S]*?\})\s*-->\s*$/;
const TAG_RE = /^[\p{L}\p{N}][\p{L}\p{N}._+-]{0,29}$/u;

export function normalizeTags(input: string[] | string): string[] {
  const list = Array.isArray(input) ? input : input.split(/[,\s#，、]+/);
  const out: string[] = [];
  for (const raw of list) {
    const tag = raw.trim().toLowerCase();
    if (tag && TAG_RE.test(tag) && !out.includes(tag)) out.push(tag);
  }
  return out;
}

export function parseMeta(body: string): { body: string; meta: ThreadMeta } {
  const match = body.match(META_RE);
  if (!match) return { body, meta: {} };
  let meta: ThreadMeta = {};
  try {
    const raw = JSON.parse(match[1]) as Record<string, unknown>;
    if (Array.isArray(raw.tags)) meta.tags = normalizeTags(raw.tags.filter((t): t is string => typeof t === "string"));
    const m = raw.meetup as Record<string, unknown> | undefined;
    if (m && typeof m.city === "string") {
      meta.meetup = { city: m.city, when: String(m.when ?? ""), venue: String(m.venue ?? "") };
    }
  } catch {
    meta = {};
  }
  return { body: body.slice(0, match.index).trimEnd(), meta };
}

export function withMeta(body: string, meta: ThreadMeta): string {
  const clean: ThreadMeta = {};
  if (meta.tags?.length) clean.tags = meta.tags;
  if (meta.meetup) clean.meetup = meta.meetup;
  if (!clean.tags && !clean.meetup) return body.trimEnd();
  // "-->" inside JSON strings would end the comment early; escape it.
  const json = JSON.stringify(clean).replace(/--/g, "-\\u002d");
  return `${body.trimEnd()}\n\n<!-- grapevine ${json} -->`;
}

/** City → map coordinates for meetup pins (no geocoding service needed). */
export const MEETUP_CITIES: Record<string, { lat: number; lng: number }> = {
  台北: { lat: 25.0418, lng: 121.5654 },
  新北: { lat: 25.012, lng: 121.4657 },
  桃園: { lat: 24.9936, lng: 121.301 },
  新竹: { lat: 24.8066, lng: 120.9686 },
  台中: { lat: 24.1477, lng: 120.6736 },
  台南: { lat: 22.9997, lng: 120.227 },
  高雄: { lat: 22.6273, lng: 120.3014 },
  宜蘭: { lat: 24.7021, lng: 121.7378 },
  花蓮: { lat: 23.9871, lng: 121.6015 },
};

/** Plain-text summary for cards and meta descriptions. */
export function excerptOf(markdown: string, max = 140): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_>#~|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
