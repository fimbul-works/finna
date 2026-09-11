import { createPredicate } from "../predicate.js";
import type { ArrayOperator, Predicate, QueryContext } from "../types.js";

/**
 * Creates a predicate for array operators.
 *
 * @template T - Type of the value to compare
 *
 * @param {ArrayOperator} operator - The array operator (e.g. '$all', '$some', '$none', '$size')
 * @param {any} expected - The expected values or nested filter for size
 * @param {QueryContext} ctx - Query context
 * @returns {Predicate<T>} A predicate function for the array operator
 */
export function createArrayPredicate<T = any>(operator: ArrayOperator, expected: any, ctx: QueryContext): Predicate<T> {
  const checkArray = (actual: any) => {
    if (!Array.isArray(actual)) {
      if (actual !== null && actual !== undefined) {
        ctx.warnings.add(`Operator ${operator} used on non-array type: ${typeof actual}`);
      }
      return false;
    }
    return true;
  };

  switch (operator) {
    case "$all":
      return (actual: any, root?: any) => {
        if (!checkArray(actual)) return false;
        if (Array.isArray(expected)) {
          return expected.every((val) => actual.indexOf(val) !== -1);
        }
        const p = createPredicate(expected, ctx);
        return actual.every((item: any) => p(item, root));
      };
    case "$some":
      return (actual: any, root?: any) => {
        if (!checkArray(actual)) return false;
        if (Array.isArray(expected)) {
          return expected.some((val) => actual.indexOf(val) !== -1);
        }
        const p = createPredicate(expected, ctx);
        return actual.some((item: any) => p(item, root));
      };
    case "$none":
      return (actual: any, root?: any) => {
        if (!checkArray(actual)) return false;
        if (Array.isArray(expected)) {
          return !expected.some((val) => actual.indexOf(val) !== -1);
        }
        const p = createPredicate(expected, ctx);
        return !actual.some((item: any) => p(item, root));
      };
    case "$size": {
      const p: Predicate<number> =
        typeof expected === "number" ? (s: number) => s === expected : createPredicate(expected, ctx);
      return (actual: any, root?: any) => checkArray(actual) && p(actual.length, root);
    }
    default:
      return () => false;
  }
}
