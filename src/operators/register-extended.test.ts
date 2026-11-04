import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../compile.js";
import type { FilterPredicate } from "../types.js";
import { clearOperators, listOperators, registerOperator } from "./operator-registry.js";
import { registerCoreOperators } from "./register-core.js";
import { registerExtendedOperators } from "./register-extended.js";

describe("registerExtendedOperators", () => {
  beforeEach(clearOperators);
  afterEach(clearOperators);

  it("installs extended element and string features independently", () => {
    const undo = registerExtendedOperators();
    expect([...listOperators().keys()].sort()).toEqual([
      "$endsWith",
      "$falsy",
      "$includes",
      "$isArray",
      "$isClass",
      "$isDate",
      "$isInteger",
      "$isNumber",
      "$isObject",
      "$isString",
      "$isSymbol",
      "$lowercase",
      "$nullish",
      "$replace",
      "$replaceAll",
      "$startsWith",
      "$truthy",
      "$uppercase",
    ]);
    registerExtendedOperators()();
    expect(listOperators().size).toBe(18);
    undo();
    expect(listOperators().size).toBe(0);
  });

  it("rejects conflicting registrations atomically", () => {
    registerOperator("$replaceAll", () => (() => true) as unknown as FilterPredicate);
    expect(() => registerExtendedOperators()).toThrow("already registered");
    expect([...listOperators().keys()]).toEqual(["$replaceAll"]);
  });

  it("resolves $field within extended predicates and composes with the core group", () => {
    const undoCore = registerCoreOperators();
    const undoExtended = registerExtendedOperators();
    const predicate = compile({ name: { $lowercase: { $eq: { $field: "expected.name" } } } });
    expect(predicate({ name: "ALICE", expected: { name: "alice" } })).toBe(true);
    expect(predicate({ name: "ALICE", expected: { name: "bob" } })).toBe(false);
    undoExtended();
    expect([...listOperators().keys()]).toContain("$eq");
    expect(listOperators().has("$lowercase")).toBe(false);
    undoCore();
    expect(listOperators().size).toBe(0);
  });

  it("requires explicit registration of nested basic operators", () => {
    registerExtendedOperators();
    expect(() => compile({ value: { $uppercase: { $eq: "A" } } })).toThrow(AggregateError);
    expect(compile({ value: { $uppercase: "A" } })({ value: "a" })).toBe(true);
  });
});
