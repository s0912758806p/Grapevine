#!/usr/bin/env node
/**
 * `npm run check:setup` — checks that GitHub Discussions and sign-in are
 * configured before you test by hand. Reads .env.local (process env wins) and
 * talks to GitHub with the read token. Never prints secret values.
 *
 * Exit code 1 when something blocks reading or signing in; missing optional
 * categories are warnings (those boards just can't take new posts yet).
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Must match `discussionCategory` in src/lib/boards.ts (test/check-setup.test.ts enforces this).
export const CATEGORIES = [
  ["公告", "Announcements"],
  ["綜合討論", "General"],
  ["技術問答", "Q&A"],
  ["作者專欄", "Columns"],
  ["週刊共讀", "Weekly"],
  ["職缺", "Jobs"],
  ["八卦牆", "Rumors"],
  ["在地聚會", "Meetups"],
];

function loadEnv(file) {
  const values = {};
  if (!existsSync(file)) return values;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) values[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
  return values;
}

async function main() {
  const fromFile = loadEnv(resolve(process.cwd(), ".env.local"));
  const env = (k) => (process.env[k] ?? fromFile[k] ?? "").trim();
  let blocking = 0;
  const ok = (msg) => console.log(`  ✓ ${msg}`);
  const warn = (msg) => console.log(`  ! ${msg}`);
  const fail = (msg) => {
    blocking += 1;
    console.log(`  ✗ ${msg}`);
  };

  console.log(existsSync(".env.local") ? "讀取 .env.local" : "找不到 .env.local（只用目前的環境變數）");

  console.log("\n網站");
  const site = env("SITE_URL");
  if (!site) fail("SITE_URL 沒有設定（本機用 http://localhost:3000）");
  else ok(`SITE_URL = ${site}；GitHub App 的 Callback URL 要有 ${site.replace(/\/$/, "")}/api/auth/callback`);

  console.log("\n論壇資料（GitHub Discussions）");
  const repo = env("GITHUB_FORUM_REPO");
  const token = env("GITHUB_READ_TOKEN");
  const [owner, name] = repo.split("/");
  if (!owner || !name) fail("GITHUB_FORUM_REPO 要是 owner/name 格式");
  if (!token) fail('GITHUB_READ_TOKEN 沒有設定（本機可用：GITHUB_READ_TOKEN="$(gh auth token)" npm run check:setup）');

  if (owner && name && token) {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "grapevine-setup-check" },
      body: JSON.stringify({
        query: `query($owner: String!, $name: String!) { repository(owner: $owner, name: $name) {
          hasDiscussionsEnabled discussionCategories(first: 25) { nodes { name } } discussions { totalCount }
        } }`,
        variables: { owner, name },
      }),
    });
    const json = res.ok ? await res.json() : null;
    const r = json?.data?.repository;
    if (!res.ok) fail(`GitHub 拒絕了讀取 token（HTTP ${res.status}），請確認 token 有效`);
    else if (!r) fail(`讀不到 ${repo}：${json?.errors?.map((e) => e.message).join("; ") ?? "repo 不存在或沒有權限"}`);
    else {
      ok(`可以讀取 ${repo}（目前 ${r.discussions.totalCount} 篇討論）`);
      if (!r.hasDiscussionsEnabled) fail("這個 repo 還沒開啟 Discussions（Settings → General → Features → Discussions）");
      const existing = new Set(r.discussionCategories.nodes.map((c) => c.name.toLowerCase()));
      for (const [board, category] of CATEGORIES) {
        if (existing.has(category.toLowerCase())) ok(`分類 ${category}（${board}）`);
        else warn(`缺少分類 ${category}：「${board}」看板暫時不能發文（在 Discussions 的分類設定新增）`);
      }
    }
  }

  console.log("\n會員登入（GitHub App）");
  const clientId = env("GITHUB_CLIENT_ID");
  const secret = env("GITHUB_CLIENT_SECRET");
  const session = env("SESSION_SECRET");
  if (!clientId) fail("GITHUB_CLIENT_ID 沒有設定");
  else if (/^Ov/.test(clientId)) fail("GITHUB_CLIENT_ID 看起來是 OAuth App（Ov 開頭）；請用 GitHub App 的 Client ID（通常是 Iv 開頭）");
  else ok("GITHUB_CLIENT_ID 已設定");
  if (!secret) fail("GITHUB_CLIENT_SECRET 沒有設定");
  else ok("GITHUB_CLIENT_SECRET 已設定");
  if (session.length < 32) fail("SESSION_SECRET 至少要 32 個字元（openssl rand -base64 48）");
  else ok("SESSION_SECRET 已設定");
  console.log("  · 也請確認：App 的 Discussions 權限是 Read and write，而且已經 Install 到論壇 repo。");

  console.log(blocking === 0 ? "\n全部就緒，可以 npm run dev 開始測試。" : `\n還有 ${blocking} 個項目要處理。`);
  process.exitCode = blocking === 0 ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error("檢查失敗：", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  });
}
