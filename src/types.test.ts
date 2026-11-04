import { compile, createGtPredicate } from "./index.js";
import type { FieldReference, Query } from "./types.js";
import { expect, expectTypeOf, it } from "vitest";
import { registerOperator, registerOperators } from "./operators/operator-registry.js";
import type { OperatorFactory, OperatorMap, OperatorName } from "./types.js";

it("constrains map keys and registration names to dollar-prefixed strings", () => {
  expectTypeOf<OperatorName>().toEqualTypeOf<`$${string}`>();
  expectTypeOf<OperatorMap>().toEqualTypeOf<Map<OperatorName, OperatorFactory>>();
  expectTypeOf<Parameters<typeof registerOperator>[0]>().toEqualTypeOf<OperatorName>();
  const operators: OperatorMap = new Map();
  expect(operators.size).toBe(0);
});

// Checked with tsc; never executed, since runtime rejection has separate coverage.
function checkOperatorNames(factory: OperatorFactory) {
  const operators: OperatorMap = new Map([["$custom", factory]]);
  operators.set("$another", factory);
  // @ts-expect-error Map keys require the dollar prefix.
  operators.set("custom", factory);
  // @ts-expect-error Registration requires the dollar prefix.
  registerOperator("custom", factory);
  // @ts-expect-error Batch registration also requires dollar-prefixed keys.
  registerOperators(new Map([["custom", factory]]));
}
void checkOperatorNames;

it("accepts typed $field comparisons in queries", () => {
  const reference: FieldReference = { $field: "limits.minimum" };
  const query: Query<{ value: number; limits: { minimum: number } }> = { value: { $gt: reference } };
  const undo = registerOperator("$gt", createGtPredicate);
  try {
    const predicate = compile(query);
    expect(predicate({ value: 10, limits: { minimum: 9 } })).toBe(true);
    expect(predicate({ value: 10, limits: { minimum: 10 } })).toBe(false);
  } finally {
    undo();
  }
});
