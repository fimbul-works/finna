import { QUERY_GT, QUERY_GTE, QUERY_LT, QUERY_LTE } from "../constants.js";
import { registerOperators } from "../operator-registry.js";
import type { ComparisonOperator, Predicate, QueryContext } from "../types.js";
import { resolveValue } from "./field.js";

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
    case QUERY_GT:
      return (actual: any, root?: any) => actual > resolveValue(expected, root);
    case QUERY_GTE:
      return (actual: any, root?: any) => actual >= resolveValue(expected, root);
    case QUERY_LT:
      return (actual: any, root?: any) => actual < resolveValue(expected, root);
    case QUERY_LTE:
      return (actual: any, root?: any) => actual <= resolveValue(expected, root);
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
  op === QUERY_GT || op === QUERY_GTE || op === QUERY_LT || op === QUERY_LTE;

/**
 * Registers comparison operators into the query engine.
 *
 * @returns {() => void} Unregister function
 */
export const registerComparisonOperators = (): (() => void) =>
  registerOperators([isComparisonOperator, createComparisonPredicate]);
