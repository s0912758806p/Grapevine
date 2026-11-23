/**
 * Data access for pages. Every read goes through a `use cache` function so
 * Next.js can prerender and revalidate it; pages never talk to an adapter
 * directly.
 *
 * Adapter selection: only the fixture adapter exists today, so the forum shows
 * sample content (with a visible banner). The GitHub Discussions adapter is the
 * next PR; it will be chosen when GITHUB_READ_TOKEN and GITHUB_FORUM_REPO are
 * set, without any change to callers.
 */
import { cacheLife, cacheTag } from "next/cache";
import { fixtureAdapter } from "./fixtures";
import type { ForumAdapter, ThreadQuery } from "./types";

function adapter(): ForumAdapter {
  return fixtureAdapter;
}

export function dataSource(): ForumAdapter["source"] {
  return adapter().source;
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
