import { compile as compileFieldQuery } from "../../compile.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createInPredicate as fieldSubjectFactory } from "./in.js";
import { createEqPredicate as fieldComparisonFactory } from "../equality/eq.js";
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
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$in", fieldSubjectFactory),
      installFieldOperator("$eq", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({
        "nested.value": { $in: ["hello", "world"], $eq: { $field: "expected.value" } },
      });
      expect(predicate({ nested: { value: "hello" }, expected: { value: "hello" } })).toBe(true);
      expect(predicate({ nested: { value: "hello" }, expected: { value: "different" } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
