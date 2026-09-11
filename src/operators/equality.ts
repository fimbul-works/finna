import { QUERY_EQ, QUERY_IN, QUERY_NOT_EQ, QUERY_NOT_IN } from "../constants.js";
import { registerOperators } from "../operator-registry.js";
import type { EqualityOperator, Predicate, QueryContext } from "../types.js";
import { isDeepEqual } from "../util.js";
import { resolveValue } from "./field.js";

/**
 * Creates a predicate for equality operators.
 *
 * @param {EqualityOperator} operator - The equality operator (e.g. '$eq', '$ne', '$in', '$nin')
 * @param {any} expected - The expected value or array of values
 * @param {QueryContext} ctx - Query context
 * @returns {Predicate} A predicate function for the equality operator
 */
export function createEqualityPredicate(operator: EqualityOperator, expected: any, ctx: QueryContext): Predicate {
  if ((operator === QUERY_IN || operator === QUERY_NOT_IN) && !Array.isArray(expected)) {
    ctx.warnings.add(`Operator ${operator} expects an array, but got ${typeof expected}`);
  }

  switch (operator) {
    case QUERY_EQ:
      return ((actual: any, root?: any) => isDeepEqual(actual, resolveValue(expected, root))) as Predicate;
    case QUERY_NOT_EQ:
      return ((actual: any, root?: any) => !isDeepEqual(actual, resolveValue(expected, root))) as Predicate;
    case QUERY_IN:
      return ((actual: any) =>
        Array.isArray(expected) && expected.some((item) => isDeepEqual(actual, item))) as Predicate;
    case QUERY_NOT_IN:
      return ((actual: any) =>
        Array.isArray(expected) && !expected.some((item) => isDeepEqual(actual, item))) as Predicate;
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
  op === QUERY_EQ || op === QUERY_NOT_EQ || op === QUERY_IN || op === QUERY_NOT_IN;

/**
 * Registers equality operators into the query engine.
 *
 * @returns {() => void} Unregister function
 */
export const registerEqualityOperators = (): (() => void) =>
  registerOperators([isEqualityOperator, createEqualityPredicate]);
