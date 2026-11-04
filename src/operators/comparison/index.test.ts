import { match } from "../../match.js";

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { clearOperators, listOperators } from "../operator-registry.js";
import { registerComparisonOperators } from "./index.js";

describe("comparison operators integration", () => {
  beforeEach(clearOperators);
  afterEach(clearOperators);

  it("registers and unregisters the category together", () => {
    const unregister = registerComparisonOperators();
    expect([...listOperators().keys()].sort()).toEqual(["$gt", "$gte", "$lt", "$lte"]);
    unregister();
    expect(listOperators().size).toBe(0);
    expect(() => compile({ value: { $gt: 1 } })).toThrow(AggregateError);
  });

  it("combines registered predicates in a compiled query", () => {
    registerComparisonOperators();

    const predicate = compile({ score: { $gt: 0, $gte: 10, $lt: 100, $lte: 90 } });
    expect(predicate({ score: 10 })).toBe(true);
    expect(predicate({ score: 90 })).toBe(true);
    expect(predicate({ score: 9 })).toBe(false);
    expect(predicate({ score: 91 })).toBe(false);
  });
  it("uses $field with category-registered factories", () => {
    registerComparisonOperators();
    const predicate = compile({ score: { $gte: { $field: "limits.minimum" } } });
    expect(predicate({ score: 10, limits: { minimum: 10 } })).toBe(true);
    expect(predicate({ score: 10, limits: { minimum: 11 } })).toBe(false);
  });

  it("should match comparison operators in core", () => {
    registerComparisonOperators();
    expect(match({ age: 25 }, { age: { $gt: 20 } })).toBe(true);
    expect(match({ age: 25 }, { age: { $gte: 25 } })).toBe(true);
    expect(match({ age: 25 }, { age: { $lt: 30 } })).toBe(true);
    expect(match({ age: 25 }, { age: { $lte: 25 } })).toBe(true);
  });
});
