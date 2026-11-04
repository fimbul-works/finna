import { match } from "../../match.js";
import { registerOperator as installFieldOperator } from "../operator-registry.js";
import { createEqPredicate as fieldComparisonFactory } from "../equality/eq.js";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { clearOperators, listOperators } from "../operator-registry.js";
import { registerElementOperators } from "./index.js";

describe("element operators integration", () => {
  beforeEach(clearOperators);
  afterEach(clearOperators);

  it("registers and unregisters the category together", () => {
    const unregister = registerElementOperators();
    expect([...listOperators().keys()].sort()).toEqual([
      "$exists",
      "$falsy",
      "$isArray",
      "$isClass",
      "$isDate",
      "$isInteger",
      "$isNumber",
      "$isObject",
      "$isString",
      "$isSymbol",
      "$nullish",
      "$truthy",
      "$type",
    ]);
    unregister();
    expect(listOperators().size).toBe(0);
    expect(() => compile({ value: { $exists: 1 } })).toThrow(AggregateError);
  });

  it("combines registered predicates in a compiled query", () => {
    registerElementOperators();

    const predicate = compile({
      name: { $exists: true, $type: "string" },
      removed: { $exists: false, $type: "undefined" },
    });
    expect(predicate({ name: "Alice" })).toBe(true);
    expect(predicate({})).toBe(false);
    expect(predicate({ name: 123 })).toBe(false);
    expect(predicate({ name: "Alice", removed: null })).toBe(false);
  });
  it("uses $field with category-registered factories", () => {
    registerElementOperators();
    const undo = installFieldOperator("$eq", fieldComparisonFactory);
    const predicate = compile({ value: { $isNumber: true, $eq: { $field: "expected.value" } } });
    expect(predicate({ value: 10, expected: { value: 10 } })).toBe(true);
    expect(predicate({ value: 10, expected: { value: 11 } })).toBe(false);
    undo();
  });

  it("should match element operators in core", () => {
    registerElementOperators();
    expect(match({ name: "Alice" }, { name: { $exists: true } })).toBe(true);
    expect(match({ name: "Alice" }, { missing: { $exists: false } })).toBe(true);
    expect(match({ age: 30 }, { age: { $type: "number" } })).toBe(true);
  });
});
