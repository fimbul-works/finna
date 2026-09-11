import type { ComparisonOperator, Predicate, QueryContext } from "../types.js";
import { resolveValue } from "../util.js";

/**
 * Creates a predicate for comparison operators.
 *
 * @template T - Type of the value to compare
 *
 * @param {ComparisonOperator} operator - The comparison operator (e.g. '$gt', '$gte', '$lt', '$lte')
 * @param {any} expected - The expected value
 * @param {QueryContext} _ctx - Query context
 * @returns {Predicate<T>} A predicate function for the comparison operator
 */
export function createComparisonPredicate<T = any>(
  operator: ComparisonOperator,
  expected: any,
  _ctx: QueryContext,
): Predicate<T> {
  switch (operator) {
    case "$gt":
      return (actual: any, root?: any) => actual > resolveValue(expected, root);
    case "$gte":
      return (actual: any, root?: any) => actual >= resolveValue(expected, root);
    case "$lt":
      return (actual: any, root?: any) => actual < resolveValue(expected, root);
    case "$lte":
      return (actual: any, root?: any) => actual <= resolveValue(expected, root);
    default:
      return () => false;
  }
}
