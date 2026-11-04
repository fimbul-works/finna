import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { compile } from "../../compile.js";
import { createPredicate } from "../../predicate.js";
import { registerComparisonOperators } from "../comparison/index.js";
import { clearOperators, listOperators } from "../operator-registry.js";
import { registerArrayOperators } from "./index.js";

describe("array operators integration", () => {
  beforeEach(clearOperators);
  afterEach(clearOperators);

  it("registers and unregisters all four array operators together", () => {
    const unregister = registerArrayOperators();
    expect([...listOperators().keys()].sort()).toEqual(["$all", "$none", "$size", "$some"]);
    unregister();
    expect(listOperators().size).toBe(0);
    expect(() => compile({ tags: { $some: "ts" } })).toThrow(AggregateError);
  });

  it("combines all array operators in a compiled field query", () => {
    registerArrayOperators();
    registerComparisonOperators();
    const predicate = compile({
      scores: {
        $all: [10, 20],
        $some: { $gt: 15 },
        $none: [99],
        $size: { $gte: 2, $lte: 3 },
      },
    });
    expect(predicate({ scores: [10, 20] })).toBe(true);
    expect(predicate({ scores: [10, 20, 30] })).toBe(true);
    expect(predicate({ scores: [10, 30] })).toBe(false); // $all
    expect(predicate({ scores: [10, 20, 99] })).toBe(false); // $none
    expect(predicate({ scores: [10, 20, 30, 40] })).toBe(false); // $size
  });

  it("combines nested array predicates with comparison predicates and root references", () => {
    registerArrayOperators();
    registerComparisonOperators();
    const predicate = compile({
      scores: {
        $all: { $gte: { $field: "minimum" } },
        $some: { $gt: { $field: "target" } },
        $none: { $lt: 0 },
        $size: 2,
      },
    });
    expect(predicate({ scores: [10, 20], minimum: 10, target: 15 })).toBe(true);
    expect(predicate({ scores: [10, 20], minimum: 15, target: 15 })).toBe(false);
    expect(predicate({ scores: [10, 20], minimum: 10, target: 20 })).toBe(false);
    expect(predicate({ scores: [-1, 20], minimum: -5, target: 15 })).toBe(false);
  });
  it("should not match array operators until registered", () => {
    const data = { tags: [1, 2, 3] };

    expect(() => createPredicate({ tags: { $size: 3 } })).toThrow(AggregateError);

    // Register array operators
    registerArrayOperators();
    const pArrayAfter = createPredicate({ tags: { $size: 3 } });
    expect(pArrayAfter(data)).toBe(true);
  });
});
