import { describe, expect, it } from "vitest";
import "../index.js";
import { createFinnaContext } from "../context.js";
import { createArrayPredicate } from "./array.js";

describe("createArrayPredicate", () => {
  const ctx = createFinnaContext();
  const tags = ["ts", "js", "vitest"];

  it("should handle $all", () => {
    const p = createArrayPredicate("$all", ["ts", "js"], ctx);
    expect(p(tags)).toBe(true);
    expect(p(["ts"])).toBe(false);
  });

  it("should handle $some", () => {
    const p = createArrayPredicate("$some", ["js", "rust"], ctx);
    expect(p(tags)).toBe(true);
    expect(p(["rust"])).toBe(true);
    expect(p(["python"])).toBe(false);
  });

  it("should handle $none", () => {
    const p = createArrayPredicate("$none", ["rust", "python"], ctx);
    expect(p(tags)).toBe(true);
    expect(p(["js", "rust"])).toBe(false);
  });

  it("should handle $size", () => {
    expect(createArrayPredicate("$size", 3, ctx)(tags)).toBe(true);
    expect(createArrayPredicate("$size", 2, ctx)(tags)).toBe(false);
  });

  it("should handle $size with nested operators", () => {
    const p = createArrayPredicate("$size", { $gt: 2 }, ctx);
    expect(p(tags)).toBe(true);
    expect(p(["ts"])).toBe(false);
  });
});
