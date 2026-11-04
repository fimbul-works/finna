import { describe, expect, it } from "vitest";
import { compile as compileFieldQuery } from "../../compile.js";
import { createFinnaContext } from "../../context.js";
import { createEqPredicate as fieldComparisonFactory } from "../equality/eq.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createTypePredicate, createTypePredicate as fieldSubjectFactory } from "./type.js";

describe("createTypePredicate", () => {
  it.each([
    ["string", "hello", 123],
    ["number", 123, "123"],
    ["boolean", false, 0],
    ["null", null, undefined],
    ["undefined", undefined, null],
    ["array", [], {}],
    ["object", {}, []],
    ["date", new Date(0), "1970-01-01"],
    ["bigint", BigInt(123), "123"],
    ["int", 123, 1.5],
    ["symbol", Symbol(), "symbol"],
    ["function", () => true, {}],
  ])("matches %s values", (type, matching, other) => {
    const predicate = createTypePredicate(type, createFinnaContext());
    expect(predicate(matching)).toBe(true);
    expect(predicate(other)).toBe(false);
  });
  it("excludes null and dates from object matching", () => {
    const predicate = createTypePredicate("object", createFinnaContext());
    expect(predicate(null)).toBe(false);
    expect(predicate(new Date())).toBe(false);
  });
  it("rejects unsupported type names", () => {
    for (const value of ["bogus", "toString", "__proto__", null, 1]) {
      expect(() => createTypePredicate(value, createFinnaContext())).toThrow(TypeError);
    }
  });
  it("evaluates $field references against the root document", () => {
    const cleanups = [
      installFieldOperator("$type", fieldSubjectFactory),
      installFieldOperator("$eq", fieldComparisonFactory),
    ];
    try {
      const predicate = compileFieldQuery({ "nested.value": { $type: "string", $eq: { $field: "expected.value" } } });
      expect(predicate({ nested: { value: "hello" }, expected: { value: "hello" } })).toBe(true);
      expect(predicate({ nested: { value: "hello" }, expected: { value: "different" } })).toBe(false);
    } finally {
      for (const undo of cleanups.reverse()) undo();
    }
  });
});
