import { registerOperators } from "../operator-registry.js";
import type { ComparisonOperator, FilterPredicate, FinnaContext } from "../types.js";
import { resolveValue } from "./field.js";

/**
 * Creates a predicate for comparison operators.
 *
 * @param {ComparisonOperator} operator - The comparison operator (e.g. '$gt', '$gte', '$lt', '$lte')
 * @param {any} expected - The expected value
 * @param {FinnaContext} _ctx - Query context
 * @returns {FilterPredicate} A predicate function for the comparison operator
 */
export function createComparisonPredicate(
  operator: ComparisonOperator,
  expected: any,
  _ctx: FinnaContext,
): FilterPredicate {
  switch (operator) {
    case "$gt":
      return ((actual: any, root?: any) => actual > resolveValue(expected, root)) as FilterPredicate;
    case "$gte":
      return ((actual: any, root?: any) => actual >= resolveValue(expected, root)) as FilterPredicate;
    case "$lt":
      return ((actual: any, root?: any) => actual < resolveValue(expected, root)) as FilterPredicate;
    case "$lte":
      return ((actual: any, root?: any) => actual <= resolveValue(expected, root)) as FilterPredicate;
  }

  throw new Error(`Invalid comparison query operator: ${operator}`);
}

/**
 * Checks whether an operator is a comparison operator.
 *
 * @param {string} op - Operator string to test
 * @returns {boolean} `true` if it's a comparison operator
 */
const isComparisonOperator = (op: string): op is ComparisonOperator =>
  op === "$gt" || op === "$gte" || op === "$lt" || op === "$lte";

/**
 * Registers comparison operators into the query engine.
 *
 * @returns {() => void} Unregister function
 */
export const registerComparisonOperators = (): (() => void) =>
  registerOperators([isComparisonOperator, createComparisonPredicate]);
