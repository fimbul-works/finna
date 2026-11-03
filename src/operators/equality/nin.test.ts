import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createNinPredicate } from "./nin.js";

describe("createNinPredicate", () => {
  it("tests membership using deep equality", () => {
    const predicate = createNinPredicate(["foo", { tags: [1, 2] }], createFinnaContext());
    expect(predicate("foo")).toBe(false);
    expect(predicate({ tags: [1, 2] })).toBe(false);
    expect(predicate("baz")).toBe(true);
    expect(predicate({ tags: [2, 1] })).toBe(true);
  });
  it("handles an empty candidate list", () => {
    expect(createNinPredicate([], createFinnaContext())("foo")).toBe(true);
  });
  it.each([null, undefined, "foo", 1, {}])("rejects invalid arguments %j", (expected) => {
    expect(() => createNinPredicate(expected, createFinnaContext())).toThrow(TypeError);
  });
});
