import type { MetadataRoute } from "next";

const SITE_URL = process.env.SITE_URL ?? "https://grapevine-six-gr925.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/new", "/search", "/bookmarks", "/login", "/api/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
