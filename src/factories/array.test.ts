import { describe, expect, it } from "vitest";
import { createQueryContext } from "../predicate.js";
import { createArrayPredicate } from "./array.js";

describe("createArrayPredicate", () => {
  const tags = ["ts", "js", "vitest"];

  it("should handle $all", () => {
    const p = createArrayPredicate("$all", ["ts", "js"], createQueryContext());
    expect(p(tags)).toBe(true);
    expect(p(["ts"])).toBe(false);
  });

  it("should handle $some", () => {
    const p = createArrayPredicate("$some", ["js", "rust"], createQueryContext());
    expect(p(tags)).toBe(true);
    expect(p(["rust"])).toBe(true);
    expect(p(["python"])).toBe(false);
  });

  it("should handle $none", () => {
    const p = createArrayPredicate("$none", ["rust", "python"], createQueryContext());
    expect(p(tags)).toBe(true);
    expect(p(["js", "rust"])).toBe(false);
  });

  it("should handle $size", () => {
    expect(createArrayPredicate("$size", 3, createQueryContext())(tags)).toBe(true);
    expect(createArrayPredicate("$size", 2, createQueryContext())(tags)).toBe(false);
  });

  it("should handle $size with nested operators", () => {
    const p = createArrayPredicate("$size", { $gt: 2 }, createQueryContext());
    expect(p(tags)).toBe(true);
    expect(p(["ts"])).toBe(false);
  });
});
