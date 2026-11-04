import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../compile.js";
import type { FilterPredicate } from "../types.js";
import { clearOperators, listOperators, registerOperator } from "./operator-registry.js";
import { registerCoreOperators } from "./register-core.js";

describe("registerCoreOperators", () => {
  beforeEach(clearOperators);
  afterEach(clearOperators);

  it("installs equality, comparison, array, existence, type, and regex operators", () => {
    const undo = registerCoreOperators();
    expect([...listOperators().keys()].sort()).toEqual([
      "$all",
      "$eq",
      "$exists",
      "$gt",
      "$gte",
      "$in",
      "$lt",
      "$lte",
      "$ne",
      "$nin",
      "$none",
      "$regex",
      "$size",
      "$some",
      "$type",
    ]);
    const duplicateUndo = registerCoreOperators();
    duplicateUndo();
    expect(listOperators().size).toBe(15);
    undo();
    expect(listOperators().size).toBe(0);
  });

  it("rejects conflicting registrations atomically", () => {
    registerOperator("$regex", () => (() => true) as unknown as FilterPredicate);
    expect(() => registerCoreOperators()).toThrow("already registered");
    expect([...listOperators().keys()]).toEqual(["$regex"]);
  });

  it("compiles $field comparisons and keeps unselected features unavailable", () => {
    registerCoreOperators();
    const predicate = compile({ "node.end": { $gt: { $field: "node.start" }, $type: "number" } });
    expect(predicate({ node: { start: 5, end: 10 } })).toBe(true);
    expect(predicate({ node: { start: 10, end: 5 } })).toBe(false);
    for (const name of ["$year", "$startsWith", "$isString"]) {
      expect(() => compile({ value: { [name]: true } })).toThrow(AggregateError);
    }
  });
  it("supports all array operators and nested $field comparisons using only core registration", () => {
    registerCoreOperators();
    const predicate = compile({
      scores: {
        $all: { $gte: { $field: "limits.minimum" } },
        $some: { $gt: { $field: "limits.target" } },
        $none: { $lt: 0 },
        $size: { $eq: { $field: "limits.count" } },
      },
    });
    expect(predicate({ scores: [10, 20], limits: { minimum: 10, target: 15, count: 2 } })).toBe(true);
    expect(predicate({ scores: [10, 20], limits: { minimum: 11, target: 15, count: 2 } })).toBe(false);
    expect(predicate({ scores: [10, 20], limits: { minimum: 10, target: 20, count: 2 } })).toBe(false);
    expect(predicate({ scores: [-1, 20], limits: { minimum: -1, target: 15, count: 2 } })).toBe(false);
    expect(predicate({ scores: [10, 20], limits: { minimum: 10, target: 15, count: 3 } })).toBe(false);
  });
});
