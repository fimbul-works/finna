import { createFinnaContext } from "./context.js";
import { operatorGroups } from "./operator-registry.js";
import type { FilterPredicate, FinnaContext, QueryOperator } from "./types.js";
import { isDeepEqual, isObject, isOperatorObject } from "./util.js";

/**
 * Create a predicate function from a query value.
 *
 * @template T - Type of the value to test
 *
 * @param {any} filter - The query filter to create a predicate for
 * @param {FinnaContext | boolean} [ctx=createFinnaContext()] - Optional query context
 * @returns {FilterPredicate<T>} A predicate function for the given filter
 */
export function createPredicate<T = any>(filter: any, ctx: FinnaContext = createFinnaContext()): FilterPredicate<T> {
  if (typeof filter === "function") {
    return ((actual: any, root?: any) => Boolean(filter(actual, root))) as FilterPredicate<T>;
  }

  if (filter instanceof RegExp) {
    return ((actual: any) => typeof actual === "string" && (filter as RegExp).test(actual)) as FilterPredicate<T>;
  }

  if (filter instanceof Date) {
    const t = (filter as Date).getTime();
    return ((actual: any) =>
      actual instanceof Date ? (actual as Date).getTime() === t : actual === t) as FilterPredicate<T>;
  }

  if (isOperatorObject(filter)) {
    const predicates = Object.entries(filter).map(([op, expected]) =>
      createOperatorPredicate(op as QueryOperator, expected, ctx),
    );
    return ((actual: any, root?: any) => predicates.every((p) => p(actual, root))) as FilterPredicate<T>;
  }

  if (isObject(filter) && !(filter instanceof Date) && !(filter instanceof RegExp)) {
    return ((actual: any, root?: any) => {
      if (!isObject(actual) || actual instanceof Date || actual instanceof RegExp) {
        return false;
      }
      return Object.entries(filter).every(([key, subFilter]) => {
        const subPredicate = createPredicate(subFilter, ctx);
        return subPredicate((actual as any)[key], root ?? actual);
      });
    }) as FilterPredicate<T>;
  }

  return ((actual: any) => isDeepEqual(actual, filter)) as FilterPredicate<T>;
}

/**
 * Create a predicate for a specific operator.
 *
 * @template T
 * @param {QueryOperator} operator - The operator string (e.g. '$eq', '$gt')
 * @param {any} expected - The expected value or nested filter
 * @param {FinnaContext} ctx - Query context
 * @returns {FilterPredicate<T>} A predicate function for the operator
 */
export function createOperatorPredicate<T = any>(
  operator: QueryOperator,
  expected: any,
  ctx: FinnaContext,
): FilterPredicate<T> {
  for (const group of operatorGroups) {
    const [matches, register] = group;
    if (matches(operator)) {
      return register(operator, expected, ctx);
    }
  }

  throw new Error(`Invalid query operator: ${operator}`);
}
