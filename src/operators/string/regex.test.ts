import { compile as compileFieldQuery } from "../../compile.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createRegexPredicate as fieldSubjectFactory } from "./regex.js";
import { createEqPredicate as fieldComparisonFactory } from "../equality/eq.js";
import { describe, expect, it } from "vitest";
import { createFinnaContext } from "../../context.js";
import { createRegexPredicate } from "./regex.js";

describe("createRegexPredicate", () => {
  it("accepts RegExp instances and regex source strings", () => {
    for (const expected of [/^foo/, "^foo"]) {
      const predicate = createRegexPredicate(expected, createFinnaContext());
      expect(predicate("foobar")).toBe(true);
      expect(predicate("barfoo")).toBe(false);
    }
  });
  it("rejects invalid regex syntax during creation", () => {
    expect(() => createRegexPredicate("[", createFinnaContext())).toThrow(SyntaxError);
  });
  it.each([null, undefined, 42, {}, []])("rejects non-string input %j", (actual) => {
    expect(createRegexPredicate("foo", createFinnaContext())(actual)).toBe(false);
  });
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$regex", fieldSubjectFactory),
      installFieldOperator("$eq", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ "nested.value": { $regex: "^hello", $eq: { $field: "expected.value" } } });
      expect(predicate({ nested: { value: "hello" }, expected: { value: "hello" } })).toBe(true);
      expect(predicate({ nested: { value: "hello" }, expected: { value: "different" } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
