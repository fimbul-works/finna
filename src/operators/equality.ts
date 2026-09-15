import { registerOperators } from "../operator-registry.js";
import type { EqualityOperator, FilterPredicate, FinnaContext } from "../types.js";
import { isDeepEqual } from "../util.js";
import { resolveValue } from "./field.js";

/**
 * Creates a predicate for equality operators.
 *
 * @param {EqualityOperator} operator - The equality operator (e.g. '$eq', '$ne', '$in', '$nin')
 * @param {any} expected - The expected value or array of values
 * @param {FinnaContext} ctx - Query context
 * @returns {FilterPredicate} A predicate function for the equality operator
 */
export function createEqualityPredicate(operator: EqualityOperator, expected: any, ctx: FinnaContext): FilterPredicate {
  if ((operator === "$in" || operator === "$nin") && !Array.isArray(expected)) {
    ctx.warnings.add(`Operator ${operator} expects an array, but got ${typeof expected}`);
  }

  switch (operator) {
    case "$eq":
      return ((actual: any, root?: any) => isDeepEqual(actual, resolveValue(expected, root))) as FilterPredicate;
    case "$ne":
      return ((actual: any, root?: any) => !isDeepEqual(actual, resolveValue(expected, root))) as FilterPredicate;
    case "$in":
      return ((actual: any) =>
        Array.isArray(expected) && expected.some((item) => isDeepEqual(actual, item))) as FilterPredicate;
    case "$nin":
      return ((actual: any) =>
        Array.isArray(expected) && !expected.some((item) => isDeepEqual(actual, item))) as FilterPredicate;
  }

  throw new Error(`Invalid equality query operator: ${operator}`);
}

/**
 * Checks whether an operator is an equality operator.
 *
 * @param {string} op - Operator string to test
 * @returns {boolean} `true` if it's an equality operator
 */
const isEqualityOperator = (op: string): op is EqualityOperator =>
  op === "$eq" || op === "$ne" || op === "$in" || op === "$nin";

/**
 * Registers equality operators into the query engine.
 *
 * @returns {() => void} Unregister function
 */
export const registerEqualityOperators = (): (() => void) =>
  registerOperators([isEqualityOperator, createEqualityPredicate]);
