#!/usr/bin/env node
/**
 * Regenerates public/build-info.json with current build metadata.
 *
 * Run standalone via `npm run build:info`, or automatically by the
 * "Daily Safe Deploy" GitHub Actions workflow. The file is a static asset
 * (copied verbatim into dist/ by Vite) and is NOT imported by application
 * code, so updating it carries zero runtime risk for the live site.
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outPath = resolve(root, "public", "build-info.json");

// Never let a missing/locked git context throw — fall back gracefully.
function git(cmd, fallback = "unknown") {
  try {
    return execSync(`git ${cmd}`, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return fallback;
  }
}

const now = new Date();
const info = {
  name: "grapevine",
  buildDate: now.toISOString().slice(0, 10), // YYYY-MM-DD (UTC)
  buildTime: now.toISOString(), // full ISO-8601 timestamp (UTC)
  commit: git("rev-parse --short HEAD"),
  branch: git("rev-parse --abbrev-ref HEAD"),
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(info, null, 2) + "\n");
console.log("Updated build-info.json:", info);
