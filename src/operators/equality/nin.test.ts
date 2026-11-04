import { compile as compileFieldQuery } from "../../compile.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createNinPredicate as fieldSubjectFactory } from "./nin.js";
import { createEqPredicate as fieldComparisonFactory } from "../equality/eq.js";
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
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$nin", fieldSubjectFactory),
      installFieldOperator("$eq", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({
        "nested.value": { $nin: ["excluded"], $eq: { $field: "expected.value" } },
      });
      expect(predicate({ nested: { value: "hello" }, expected: { value: "hello" } })).toBe(true);
      expect(predicate({ nested: { value: "hello" }, expected: { value: "different" } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
