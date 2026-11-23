import { describe, expect, it } from "vitest";
import { BOARDS } from "@/lib/boards";
import { CATEGORIES } from "../scripts/check-setup.mjs";

describe("check-setup script", () => {
  it("knows exactly the Discussions categories the boards use", () => {
    expect(CATEGORIES).toEqual(BOARDS.map((b) => [b.name, b.discussionCategory]));
  });
});
