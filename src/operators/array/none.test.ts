import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createNonePredicate } from "./none.js";

describe("createNonePredicate", () => {
  it("matches literal array membership", () => {
    const predicate = createNonePredicate(["rust", "python"], createFinnaContext());
    expect(predicate(["ts", "js"])).toBe(true);
    expect(predicate(["js", "rust"])).toBe(false);
  });

  it("evaluates item predicates with the root value", () => {
    const predicate = createNonePredicate(
      (value: number, root: { minimum: number }) => value >= root.minimum,
      createFinnaContext(),
    );
    expect(predicate([1, 2], { minimum: 10 })).toBe(true);
    expect(predicate([1, 20], { minimum: 10 })).toBe(false);
  });

  it("handles empty arrays", () => {
    expect(createNonePredicate([1], createFinnaContext())([])).toBe(true);
    expect(createNonePredicate([], createFinnaContext())([1])).toBe(true);
    expect(createNonePredicate((value: number) => value > 0, createFinnaContext())([])).toBe(true);
  });

  it.each([null, undefined, "array", 3, {}])("rejects non-array input %j", (actual) => {
    expect(createNonePredicate([1], createFinnaContext())(actual)).toBe(false);
  });
});
