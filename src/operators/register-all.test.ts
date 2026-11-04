import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../compile.js";
import type { FilterPredicate } from "../types.js";
import { clearOperators, listOperators, registerOperator } from "./operator-registry.js";
import { registerAllOperators } from "./register-all.js";

describe("registerAllOperators", () => {
  beforeEach(clearOperators);
  afterEach(clearOperators);

  it("registers all operators atomically and idempotently", () => {
    registerAllOperators();
    const count = listOperators().size;
    registerAllOperators();
    expect(listOperators().size).toBe(count);
    clearOperators();
    registerOperator("$size", () => (() => true) as unknown as FilterPredicate);
    expect(() => registerAllOperators()).toThrow();
    expect([...listOperators().keys()]).toEqual(["$size"]);
  });

  it("includes every element check in the full registration", () => {
    registerAllOperators();
    for (const name of [
      "$truthy",
      "$falsy",
      "$nullish",
      "$isNumber",
      "$isString",
      "$isInteger",
      "$isObject",
      "$isArray",
      "$isDate",
      "$isSymbol",
      "$isClass",
    ]) {
      expect(listOperators().has(name as `$${string}`)).toBe(true);
    }
  });

  it("compiles $field comparisons after registration and preserves them after cleanup", () => {
    const undo = registerAllOperators();
    const predicate = compile({ scores: { $all: { $gte: { $field: "limits.minimum" } } } });
    undo();
    expect(listOperators().size).toBe(0);
    expect(predicate({ scores: [10, 20], limits: { minimum: 10 } })).toBe(true);
    expect(predicate({ scores: [10, 20], limits: { minimum: 11 } })).toBe(false);
  });
});
