import { QUERY_ALL, QUERY_NONE, QUERY_SIZE, QUERY_SOME } from "../constants.js";
import { registerOperators } from "../operator-registry.js";
import { createPredicate } from "../predicate.js";
import type { ArrayOperator, Predicate, QueryContext } from "../types.js";

/**
 * Creates a predicate for array operators.
 *
 * @param {ArrayOperator} operator - The array operator (e.g. '$all', '$some', '$none', '$size')
 * @param {any} expected - The expected values or nested filter for size
 * @param {QueryContext} ctx - Query context
 * @returns {Predicate} A predicate function for the array operator
 */
export function createArrayPredicate(operator: ArrayOperator, expected: any, ctx: QueryContext): Predicate {
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
    case QUERY_ALL:
      return ((actual: any, root?: any) => {
        if (!checkArray(actual)) {
          return false;
        }
        if (Array.isArray(expected)) {
          return expected.every((val) => actual.indexOf(val) !== -1);
        }
        const p = createPredicate(expected, ctx);
        return actual.every((item: any) => p(item, root));
      }) as Predicate;
    case QUERY_SOME:
      return ((actual: any, root?: any) => {
        if (!checkArray(actual)) {
          return false;
        }
        if (Array.isArray(expected)) {
          return expected.some((val) => actual.indexOf(val) !== -1);
        }
        const p = createPredicate(expected, ctx);
        return actual.some((item: any) => p(item, root));
      }) as Predicate;
    case QUERY_NONE:
      return ((actual: any, root?: any) => {
        if (!checkArray(actual)) {
          return false;
        }
        if (Array.isArray(expected)) {
          return !expected.some((val) => actual.indexOf(val) !== -1);
        }
        const p = createPredicate(expected, ctx);
        return !actual.some((item: any) => p(item, root));
      }) as Predicate;
    case QUERY_SIZE: {
      const p: any = typeof expected === "number" ? (s: number) => s === expected : createPredicate(expected, ctx);
      return ((actual: any, root?: any) => checkArray(actual) && p(actual.length, root)) as Predicate;
    }
  }

  throw new Error(`Invalid array query operator: ${operator}`);
}

/**
 * Checks whether an operator is an array operator.
 *
 * @param {string} op - Operator string to test
 * @returns {boolean} `true` if it's an array operator
 */
const isArrayOperator = (op: string): op is ArrayOperator =>
  op === QUERY_ALL || op === QUERY_SOME || op === QUERY_NONE || op === QUERY_SIZE;

/**
 * Registers array operators into the query engine.
 *
 * @returns {() => void} Unregister function
 */
export const registerArrayOperators = (): (() => void) => registerOperators([isArrayOperator, createArrayPredicate]);
