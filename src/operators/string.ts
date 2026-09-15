import { registerOperators } from "../operator-registry.js";
import type { FilterPredicate, FinnaContext, StringOperator } from "../types.js";
import { resolveValue } from "./field.js";

/**
 * Creates a predicate for string operators.
 *
 * @param {StringOperator} operator - The string operator (e.g. '$regex', '$startsWith', '$endsWith', '$includes')
 * @param {any} expected - The expected value or regex
 * @param {FinnaContext} _ctx - Query context
 * @returns {FilterPredicate} A predicate function for the string operator
 */
export function createStringPredicate(operator: StringOperator, expected: any, _ctx: FinnaContext): FilterPredicate {
  const isStr = (actual: any) => typeof actual === "string";

  switch (operator) {
    case "$regex": {
      const re = expected instanceof RegExp ? expected : new RegExp(String(expected));
      return ((actual: any) => isStr(actual) && re.test(actual)) as FilterPredicate;
    }
    case "$startsWith":
      return ((actual: any, root?: any) =>
        isStr(actual) && actual.startsWith(String(resolveValue(expected, root)))) as FilterPredicate;
    case "$endsWith":
      return ((actual: any, root?: any) =>
        isStr(actual) && actual.endsWith(String(resolveValue(expected, root)))) as FilterPredicate;
    case "$includes":
      return ((actual: any, root?: any) =>
        isStr(actual) && actual.includes(String(resolveValue(expected, root)))) as FilterPredicate;
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
  op === "$regex" || op === "$startsWith" || op === "$endsWith" || op === "$includes";

/**
 * Registers string operators into the query engine.
 *
 * @returns {() => void} Unregister function
 */
export const registerStringOperators = (): (() => void) => registerOperators([isStringOperator, createStringPredicate]);
