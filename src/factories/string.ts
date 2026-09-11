import type { Predicate, QueryContext, StringOperator } from "../types.js";
import { resolveValue } from "../util.js";

/**
 * Creates a predicate for string operators.
 *
 * @template T - Type of the value to compare
 *
 * @param {StringOperator} operator - The string operator (e.g. '$regex', '$startsWith', '$endsWith', '$includes')
 * @param {any} expected - The expected value or regex
 * @param {QueryContext} _ctx - Query context
 * @returns {Predicate<T>} A predicate function for the string operator
 */
export function createStringPredicate<T = any>(
  operator: StringOperator,
  expected: any,
  _ctx: QueryContext,
): Predicate<T> {
  switch (operator) {
    case "$regex":
      return (actual: any) => {
        const re = expected instanceof RegExp ? expected : new RegExp(String(expected));
        return typeof actual === "string" && re.test(actual);
      };
    case "$startsWith":
      return (actual: any, root?: any) => {
        const val = resolveValue(expected, root);
        return typeof actual === "string" && actual.startsWith(String(val));
      };
    case "$endsWith":
      return (actual: any, root?: any) => {
        const val = resolveValue(expected, root);
        return typeof actual === "string" && actual.endsWith(String(val));
      };
    case "$includes":
      return (actual: any, root?: any) => {
        const val = resolveValue(expected, root);
        return typeof actual === "string" && actual.includes(String(val));
      };
    default:
      return () => false;
  }
}
