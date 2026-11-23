/**
 * Data access for pages. Every read goes through a `use cache` function so
 * Next.js can prerender and revalidate it; pages never talk to an adapter
 * directly.
 *
 * Adapter selection: GitHub Discussions when GITHUB_FORUM_REPO and
 * GITHUB_READ_TOKEN are set (src/lib/forum/github.ts), otherwise built-in
 * sample data (src/lib/forum/fixtures.ts) with a visible banner.
 *
 * Cache tags: "threads" for every list, `thread-<n>` per discussion; Server
 * Actions call updateTag() on them after a write.
 */
import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { githubForum } from "../config";
import { fixtureAdapter } from "./fixtures";
import { createGithubAdapter } from "./github";
import type { ForumAdapter, ThreadQuery } from "./types";

let cached: ForumAdapter | undefined;
function adapter(): ForumAdapter {
  if (!cached) {
    const gh = githubForum();
    cached = gh ? createGithubAdapter(gh.repo, gh.readToken) : fixtureAdapter;
  }
  return cached;
}

export function dataSource(): ForumAdapter["source"] {
  return adapter().source;
}

export function forumRepoUrl(): string | undefined {
  return adapter().repoUrl;
}

export async function listThreads(query: ThreadQuery) {
  "use cache";
  cacheLife("minutes");
  cacheTag("threads");
  return adapter().listThreads(query);
}

export async function getThread(number: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("threads", `thread-${number}`);
  return adapter().getThread(number);
}

export async function getMirrorThread(board: string, number: number) {
  "use cache";
  cacheLife("hours");
  cacheTag(`mirror-${board}`);
  return adapter().getMirrorThread(board, number);
}

export async function getBoardStatus() {
  "use cache";
  cacheLife("minutes");
  cacheTag("categories");
  return adapter().boardStatus();
}

export async function getProfile(login: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`member-${login}`);
  return adapter().getProfile(login);
}

export async function getLeaderboard() {
  "use cache";
  cacheLife("hours");
  return adapter().leaderboard();
}

export async function getHotTags() {
  "use cache";
  cacheLife("hours");
  return adapter().hotTags();
}

export async function getStats() {
  "use cache";
  cacheLife("hours");
  return adapter().stats();
}
