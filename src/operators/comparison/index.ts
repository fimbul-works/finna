import type { ComparisonOperator, FilterPredicate, FinnaContext, OperatorMap } from "../../types.js";
import { registerOperators } from "../operator-registry.js";
import { createGtPredicate } from "./gt.js";
import { createGtePredicate } from "./gte.js";
import { createLtPredicate } from "./lt.js";
import { createLtePredicate } from "./lte.js";

export * from "./gt.js";
export * from "./gte.js";
export * from "./lt.js";
export * from "./lte.js";

const comparisonOperators: OperatorMap<ComparisonOperator> = new Map([
  ["$gte", createGtePredicate],
  ["$gt", createGtPredicate],
  ["$lte", createLtePredicate],
  ["$lt", createLtPredicate],
]);

/**
 * Creates a predicate using a built-in comparison factory without registering it.
 *
 * @param operator - The comparison operator to compile.
 * @param expected - The operator argument or nested filter.
 * @param ctx - Compilation context shared with the selected factory.
 * @returns The compiled predicate returned by the selected factory.
 * @throws {Error} If operator is not a built-in comparison operator, or its factory rejects the argument.
 */
export function createComparisonPredicate(
  operator: ComparisonOperator,
  expected: any,
  ctx: FinnaContext,
): FilterPredicate {
  const factory = comparisonOperators.get(operator);
  if (!factory) throw new Error(`Invalid comparison query operator: ${operator}`);
  return factory(expected, ctx);
}

/**
 * Registers all built-in comparison operators atomically.
 *
 * @returns An idempotent cleanup function removing only operators installed by this call.
 * @throws {Error} If an operator name is already registered with a different factory.
 */
export const registerComparisonOperators = (): (() => void) => registerOperators(comparisonOperators);
