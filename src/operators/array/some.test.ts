import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createSomePredicate } from "./some.js";

describe("createSomePredicate", () => {
  it("matches literal array membership", () => {
    const predicate = createSomePredicate(["js", "rust"], createFinnaContext());
    expect(predicate(["ts", "js"])).toBe(true);
    expect(predicate(["python"])).toBe(false);
  });

  it("evaluates item predicates with the root value", () => {
    const predicate = createSomePredicate(
      (value: number, root: { minimum: number }) => value >= root.minimum,
      createFinnaContext(),
    );
    expect(predicate([1, 20], { minimum: 10 })).toBe(true);
    expect(predicate([1, 2], { minimum: 10 })).toBe(false);
  });

  it("handles empty arrays", () => {
    expect(createSomePredicate([1], createFinnaContext())([])).toBe(false);
    expect(createSomePredicate([], createFinnaContext())([1])).toBe(false);
    expect(createSomePredicate((value: number) => value > 0, createFinnaContext())([])).toBe(false);
  });

  it.each([null, undefined, "array", 3, {}])("rejects non-array input %j", (actual) => {
    expect(createSomePredicate([1], createFinnaContext())(actual)).toBe(false);
  });
});
