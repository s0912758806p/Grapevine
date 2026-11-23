import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // v1 (Vite SPA) URLs → their v2 forum equivalents, so old links and search results keep working.
  async redirects() {
    return [
      { source: "/essays", has: [{ type: "query", key: "tab", value: "author-issues" }], destination: "/c/columns", permanent: true },
      { source: "/essays", destination: "/c/weekly", permanent: true },
      { source: "/github-issues", destination: "/c/weekly", permanent: true },
      { source: "/created-issues", destination: "/c/columns", permanent: true },
      { source: "/ruanyf-weekly/:number", destination: "/c/weekly", permanent: true },
      { source: "/issue/:number", destination: "/c/columns", permanent: true },
      { source: "/f2e-issue/:number", destination: "/c/jobs", permanent: true },
      { source: "/jobs", destination: "/c/jobs", permanent: true },
      { source: "/community", destination: "/c/rumors", permanent: true },
      { source: "/location", destination: "/meetups", permanent: true },
      { source: "/analytics", destination: "/stats", permanent: true },
      { source: "/new-issue", destination: "/new", permanent: true },
      { source: "/profile", destination: "/login", permanent: false },
      { source: "/settings", destination: "/", permanent: false },
      { source: "/home", destination: "/", permanent: true },
      { source: "/comments", destination: "/", permanent: true },
      { source: "/issue-submitted", destination: "/", permanent: true },
      { source: "/manage-repositories", destination: "/", permanent: true },
      { source: "/repository-issue/:repo/:number", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
