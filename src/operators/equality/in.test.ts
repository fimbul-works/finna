import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createInPredicate } from "./in.js";

describe("createInPredicate", () => {
  it("tests membership using deep equality", () => {
    const predicate = createInPredicate(["foo", { tags: [1, 2] }], createFinnaContext());
    expect(predicate("foo")).toBe(true);
    expect(predicate({ tags: [1, 2] })).toBe(true);
    expect(predicate("baz")).toBe(false);
    expect(predicate({ tags: [2, 1] })).toBe(false);
  });
  it("handles an empty candidate list", () => {
    expect(createInPredicate([], createFinnaContext())("foo")).toBe(false);
  });
  it.each([null, undefined, "foo", 1, {}])("rejects invalid arguments %j", (expected) => {
    expect(() => createInPredicate(expected, createFinnaContext())).toThrow(TypeError);
  });
});
