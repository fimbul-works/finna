import type { EqualityOperator, Predicate, QueryContext } from "../types.js";
import { isDeepEqual, resolveValue } from "../util.js";

/**
 * Creates a predicate for equality operators.
 *
 * @template T - Type of the value to compare
 *
 * @param {EqualityOperator} operator - The equality operator (e.g. '$eq', '$ne', '$in', '$nin')
 * @param {any} expected - The expected value or array of values
 * @param {QueryContext} ctx - Query context
 * @returns {Predicate<T>} A predicate function for the equality operator
 */
export function createEqualityPredicate<T = any>(
  operator: EqualityOperator,
  expected: any,
  ctx: QueryContext,
): Predicate<T> {
  if ((operator === "$in" || operator === "$nin") && !Array.isArray(expected)) {
    ctx.warnings.add(`Operator ${operator} expects an array, but got ${typeof expected}`);
  }

  switch (operator) {
    case "$eq":
      return (actual: any, root?: any) => isDeepEqual(actual, resolveValue(expected, root));
    case "$ne":
      return (actual: any, root?: any) => !isDeepEqual(actual, resolveValue(expected, root));
    case "$in":
      return (actual: any) => Array.isArray(expected) && expected.some((item) => isDeepEqual(actual, item));
    case "$nin":
      return (actual: any) => Array.isArray(expected) && !expected.some((item) => isDeepEqual(actual, item));
    default:
      return () => false;
  }
}
