import { QUERY_ENDS_WITH, QUERY_INCLUDES, QUERY_REGEX, QUERY_STARTS_WITH } from "../constants.js";
import { registerOperators } from "../operator-registry.js";
import type { FinnaContext, Predicate, StringOperator } from "../types.js";
import { resolveValue } from "./field.js";

/**
 * Creates a predicate for string operators.
 *
 * @param {StringOperator} operator - The string operator (e.g. '$regex', '$startsWith', '$endsWith', '$includes')
 * @param {any} expected - The expected value or regex
 * @param {FinnaContext} _ctx - Query context
 * @returns {Predicate} A predicate function for the string operator
 */
export function createStringPredicate(operator: StringOperator, expected: any, _ctx: FinnaContext): Predicate {
  switch (operator) {
    case QUERY_REGEX: {
      const re = expected instanceof RegExp ? expected : new RegExp(String(expected));
      return ((actual: any) => typeof actual === "string" && re.test(actual)) as Predicate;
    }
    case QUERY_STARTS_WITH:
      return ((actual: any, root?: any) =>
        typeof actual === "string" && actual.startsWith(String(resolveValue(expected, root)))) as Predicate;
    case QUERY_ENDS_WITH:
      return ((actual: any, root?: any) =>
        typeof actual === "string" && actual.endsWith(String(resolveValue(expected, root)))) as Predicate;
    case QUERY_INCLUDES:
      return ((actual: any, root?: any) =>
        typeof actual === "string" && actual.includes(String(resolveValue(expected, root)))) as Predicate;
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
