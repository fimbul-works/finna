import type { ElementOperator, Predicate, QueryContext } from "../types.js";

/**
 * Creates a predicate for element operators.
 *
 * @param {ElementOperator} operator - The element operator (e.g. '$exists', '$type')
 * @param {any} expected - The expected value (boolean for $exists, string for $type)
 * @param {QueryContext} _ctx - Query context
 * @returns {Predicate} A predicate function for the element operator
 */
export function createElementPredicate(operator: ElementOperator, expected: any, _ctx: QueryContext): Predicate {
  switch (operator) {
    case "$exists":
      return (actual: any) => (expected ? actual !== undefined : actual === undefined);
    case "$type":
      return (actual: any) => {
        if (expected === "null") return actual === null;
        if (expected === "undefined") return actual === undefined;
        if (expected === "array") return Array.isArray(actual);
        if (expected === "date") return actual instanceof Date;
        if (expected === "object") {
          return actual !== null && typeof actual === "object" && !Array.isArray(actual) && !(actual instanceof Date);
        }
        return typeof actual === expected;
      };
    default:
      return () => false;
  }
}
