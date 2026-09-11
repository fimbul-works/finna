import { QUERY_ENDS_WITH, QUERY_INCLUDES, QUERY_REGEX, QUERY_STARTS_WITH } from "../constants.js";
import { registerOperators } from "../operator-registry.js";
import type { Predicate, QueryContext, StringOperator } from "../types.js";
import { resolveValue } from "./field.js";

/**
 * Creates a predicate for string operators.
 *
 * @template T - Type of the value to compare
 *
 * @param {StringOperator} operator - The string operator (e.g. '$regex', '$startsWith', '$endsWith', '$includes')
 * @param {any} expected - The expected value or regex
 * @param {QueryContext} ctx - Query context
 * @returns {Predicate<T>} A predicate function for the string operator
 */
export function createStringPredicate<T = any>(
  operator: StringOperator,
  expected: any,
  ctx: QueryContext,
): Predicate<T> {
  switch (operator) {
    case QUERY_REGEX:
      return ((actual: any) => {
        const re = expected instanceof RegExp ? expected : new RegExp(String(expected));
        return typeof actual === "string" && re.test(actual);
      }) as Predicate<T>;
    case QUERY_STARTS_WITH:
      return ((actual: any, root?: any) => {
        const val = resolveValue(expected, root);
        return typeof actual === "string" && actual.startsWith(String(val));
      }) as Predicate<T>;
    case QUERY_ENDS_WITH:
      return ((actual: any, root?: any) => {
        const val = resolveValue(expected, root);
        return typeof actual === "string" && actual.endsWith(String(val));
      }) as Predicate<T>;
    case QUERY_INCLUDES:
      return ((actual: any, root?: any) => {
        const val = resolveValue(expected, root);
        return typeof actual === "string" && actual.includes(String(val));
      }) as Predicate<T>;
  }

  throw new Error(`Invalid string query operator: ${operator}`);
}

/**
 * Checks whether an operator is a string operator.
 *
 * @param {string} op - Operator string to test
 * @returns {boolean} `true` if it's a string operator
 */
const isStringOperator = (op: string): op is StringOperator =>
  op === QUERY_REGEX || op === QUERY_STARTS_WITH || op === QUERY_ENDS_WITH || op === QUERY_INCLUDES;

/**
 * Registers string operators into the query engine.
 *
 * @returns {() => void} Unregister function
 */
export const registerStringOperators = (): (() => void) => registerOperators([isStringOperator, createStringPredicate]);
