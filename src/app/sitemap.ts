import type { MetadataRoute } from "next";
import { BOARDS } from "@/lib/boards";
import { listThreads } from "@/lib/forum";

const SITE_URL = process.env.SITE_URL ?? "https://grapevine-six-gr925.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const threads = await listThreads({ sort: "new" });
  return [
    { url: `${SITE_URL}/`, changeFrequency: "hourly", priority: 1 },
    ...BOARDS.map((b) => ({ url: `${SITE_URL}/c/${b.slug}`, changeFrequency: "hourly" as const, priority: 0.8 })),
    ...threads.map((t) => ({ url: `${SITE_URL}/t/${t.number}`, lastModified: t.lastActivityAt, priority: 0.6 })),
    { url: `${SITE_URL}/meetups`, priority: 0.5 },
    { url: `${SITE_URL}/stats`, priority: 0.3 },
  ];
}
