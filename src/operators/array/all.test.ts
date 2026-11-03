import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createAllPredicate } from "./all.js";

describe("createAllPredicate", () => {
  it("matches literal array membership", () => {
    const predicate = createAllPredicate(["ts", "js"], createFinnaContext());
    expect(predicate(["ts", "js", "vitest"])).toBe(true);
    expect(predicate(["ts"])).toBe(false);
  });

  it("evaluates item predicates with the root value", () => {
    const predicate = createAllPredicate(
      (value: number, root: { minimum: number }) => value >= root.minimum,
      createFinnaContext(),
    );
    expect(predicate([10, 20], { minimum: 10 })).toBe(true);
    expect(predicate([1, 20], { minimum: 10 })).toBe(false);
  });

  it("handles empty arrays", () => {
    expect(createAllPredicate([1], createFinnaContext())([])).toBe(false);
    expect(createAllPredicate([], createFinnaContext())([1])).toBe(true);
    expect(createAllPredicate((value: number) => value > 0, createFinnaContext())([])).toBe(true);
  });

  it.each([null, undefined, "array", 3, {}])("rejects non-array input %j", (actual) => {
    expect(createAllPredicate([1], createFinnaContext())(actual)).toBe(false);
  });
});
