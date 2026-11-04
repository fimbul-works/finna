import { arrayOperators } from "./array/index.js";
import { comparisonOperators } from "./comparison/index.js";
import { dateOperators } from "./date/index.js";
import { elementOperators } from "./element/index.js";
import { equalityOperators } from "./equality/index.js";
import { stringOperators } from "./string/index.js";
import { coreOperators } from "./register-core.js";
import { extendedOperators } from "./register-extended.js";
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
  it("partitions every built-in into exactly one registration group", () => {
    const expected = new Map([
      ...arrayOperators,
      ...comparisonOperators,
      ...dateOperators,
      ...elementOperators,
      ...equalityOperators,
      ...stringOperators,
    ]);
    const grouped = [...coreOperators, ...dateOperators, ...extendedOperators];
    expect(grouped.length).toBe(expected.size);
    expect(new Map(grouped)).toEqual(expected);
    registerAllOperators();
    expect(listOperators()).toEqual(expected);
  });

  it("preserves earlier individual registrations when cleaning up all groups", () => {
    const eq = coreOperators.get("$eq")!;
    const undoEq = registerOperator("$eq", eq);
    const undoAll = registerAllOperators();
    undoAll();
    undoAll();
    expect([...listOperators()]).toEqual([["$eq", eq]]);
    undoEq();
    expect(listOperators().size).toBe(0);
  });
});
