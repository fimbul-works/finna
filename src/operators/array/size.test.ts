import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createSizePredicate } from "./size.js";

describe("createSizePredicate", () => {
  it("matches the exact array length", () => {
    const predicate = createSizePredicate(3, createFinnaContext());
    expect(predicate(["ts", "js", "vitest"])).toBe(true);
    expect(predicate(["ts", "js"])).toBe(false);
    expect(createSizePredicate(0, createFinnaContext())([])).toBe(true);
  });

  it("passes the array length and root to a predicate", () => {
    const predicate = createSizePredicate(
      (length: number, root: { count: number }) => length === root.count,
      createFinnaContext(),
    );
    expect(predicate([1, 2], { count: 2 })).toBe(true);
    expect(predicate([1, 2], { count: 3 })).toBe(false);
  });

  it.each([null, undefined, "array", 3, { length: 3 }])("rejects non-array input %j", (actual) => {
    expect(createSizePredicate(3, createFinnaContext())(actual)).toBe(false);
  });
});
