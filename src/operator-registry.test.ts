import { beforeEach, describe, expect, it } from "vitest";
import { createOperatorPredicate, createPredicate, registerAllOperators } from "./index.js";
import { createQueryContext } from "./query-context.js";
import { operatorGroups, clearOperators, registerOperators } from "./operator-registry.js";

describe("operator registry", () => {
  beforeEach(() => {
    registerAllOperators();
  });

  it("should allow registering custom operators via tuple", () => {
    const isBetween = (op: string) => op === "$between";
    const createBetweenPredicate = (_op: any, expected: [number, number]) => (actual: any) =>
      typeof actual === "number" && actual >= expected[0] && actual <= expected[1];

    const unregister = registerOperators([isBetween, createBetweenPredicate]);

    const p = createPredicate({ score: { $between: [10, 20] } });
    expect(p({ score: 15 })).toBe(true);
    expect(p({ score: 5 })).toBe(false);
    expect(p({ score: 25 })).toBe(false);

    unregister();

    // After unregistering, $between should throw
    expect(() => createPredicate({ score: { $between: [10, 20] } })({ score: 15 })).toThrow();
  });

  it("should prevent duplicate identical registrations", () => {
    const countBefore = operatorGroups.size;
    registerAllOperators();
    expect(operatorGroups.size).toBe(countBefore);
  });

  it("should throw an error for unknown operators", () => {
    const ctx = createQueryContext(false);
    expect(() => createOperatorPredicate("$unknownOperator" as any, 123, ctx)).toThrow();
  });

  it("should clear all operators when clearOperatorGroups is called", () => {
    clearOperators();
    expect(operatorGroups.size).toBe(0);

    expect(() => createPredicate({ age: { $gt: 20 } })({ age: 25 })).toThrow();
  });
});
