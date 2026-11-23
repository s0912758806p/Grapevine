/**
 * Keeps README.md honest: every file in its "專案結構" tree and every route in its
 * feature table must exist. Fail-closed: if the README sections can't be found or
 * parse to (almost) nothing, the test fails instead of passing vacuously.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const readme = readFileSync(join(root, "README.md"), "utf8");

function treePaths(): string[] {
  const section = readme.split("## 專案結構")[1];
  const block = section?.match(/```\n([\s\S]*?)```/)?.[1];
  if (!block) return [];
  const stack: string[] = [];
  const paths: string[] = [];
  for (const raw of block.split("\n")) {
    const line = raw.replace(/\s+#.*$/, "").trimEnd();
    if (!line.trim()) continue;
    const marker = Math.max(line.indexOf("├── "), line.indexOf("└── "));
    const depth = marker === -1 ? 0 : marker / 4 + 1;
    const name = (marker === -1 ? line : line.slice(marker + 4)).trim();
    stack.length = depth;
    stack.push(name.replace(/\/$/, ""));
    paths.push(stack.join("/"));
  }
  return paths;
}

function routePaths(): string[] {
  const section = readme.split("## 功能")[1]?.split("\n## ")[0] ?? "";
  return [...section.matchAll(/^\|[^|]*\|\s*`(\/[^`]*)`/gm)].map((m) => m[1]);
}

describe("README freshness", () => {
  it("lists only files and folders that exist", () => {
    const paths = treePaths();
    expect(paths.length, "could not parse the 專案結構 tree").toBeGreaterThan(20);
    const missing = paths.filter((p) => !existsSync(join(root, p)));
    expect(missing).toEqual([]);
  });

  it("documents only routes that exist", () => {
    const routes = routePaths();
    expect(routes.length, "could not parse the 功能 table").toBeGreaterThan(5);
    const missing = routes.filter((r) => !existsSync(join(root, "src/app", r === "/" ? "" : r, "page.tsx")));
    expect(missing).toEqual([]);
  });
});
