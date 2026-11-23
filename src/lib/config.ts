import "server-only";

/**
 * Server-side configuration read from environment variables. Nothing here is
 * ever exposed to the browser (no NEXT_PUBLIC_ prefix).
 */

export const SITE_URL = (process.env.SITE_URL ?? "https://grapevine-six-gr925.vercel.app").replace(/\/$/, "");

export interface ForumRepo {
  owner: string;
  name: string;
}

/** `GITHUB_FORUM_REPO=owner/name` + `GITHUB_READ_TOKEN` switch the forum from sample data to GitHub Discussions. */
export function githubForum(): { repo: ForumRepo; readToken: string } | null {
  const repo = process.env.GITHUB_FORUM_REPO?.trim();
  const readToken = process.env.GITHUB_READ_TOKEN?.trim();
  if (!repo || !readToken) return null;
  const [owner, name] = repo.split("/");
  if (!owner || !name) throw new Error(`GITHUB_FORUM_REPO must look like owner/name, got "${repo}"`);
  return { repo: { owner, name }, readToken };
}

/** GitHub App credentials for member sign-in (user-to-server tokens). */
export function githubApp(): { clientId: string; clientSecret: string; sessionSecret: string } | null {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  const sessionSecret = process.env.SESSION_SECRET?.trim();
  if (!clientId || !clientSecret || !sessionSecret) return null;
  if (sessionSecret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters");
  return { clientId, clientSecret, sessionSecret };
}
