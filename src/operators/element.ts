import { QUERY_EXISTS, QUERY_TYPE } from "../constants.js";
import { registerOperators } from "../operator-registry.js";
import type { ElementOperator, FinnaContext, Predicate } from "../types.js";

/**
 * Creates a predicate for element operators.
 *
 * @param {ElementOperator} operator - The element operator (e.g. '$exists', '$type')
 * @param {any} expected - The expected value (boolean for $exists, string for $type)
 * @param {FinnaContext} _ctx - Query context
 * @returns {Predicate} A predicate function for the element operator
 */
export function createElementPredicate(operator: ElementOperator, expected: any, _ctx: FinnaContext): Predicate {
  switch (operator) {
    case QUERY_EXISTS:
      return ((actual: any) => (expected ? actual !== undefined : actual === undefined)) as Predicate;
    case QUERY_TYPE:
      return ((actual: any) => {
        if (expected === "null") return actual === null;
        if (expected === "undefined") return actual === undefined;
        if (expected === "array") return Array.isArray(actual);
        if (expected === "date") return actual instanceof Date;
        if (expected === "object") {
          return actual !== null && typeof actual === "object" && !Array.isArray(actual) && !(actual instanceof Date);
        }
        return typeof actual === expected;
      }) as Predicate;
  }

  throw new Error(`Invalid element query operator: ${operator}`);
}

/**
 * Checks whether an operator is an element operator.
 *
 * @param {string} op - Operator string to test
 * @returns {boolean} `true` if it's an element operator
 */
const isElementOperator = (op: string): op is ElementOperator => op === QUERY_EXISTS || op === QUERY_TYPE;

/**
 * Registers element operators into the query engine.
 *
 * @returns {() => void} Unregister function
 */
export const registerElementOperators = (): (() => void) =>
  registerOperators([isElementOperator, createElementPredicate]);
