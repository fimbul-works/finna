import { isClass, isFn, isObj, isStr } from "@fimbul-works/hvat";
import { childContext, createFinnaContext, withCompilation } from "./context.js";
import { getOperator } from "./operators/operator-registry.js";
import type { FilterPredicate, FinnaContext, OperatorName } from "./types.js";
import { isDeepEqual, isOperatorObject } from "./util.js";

/**
 * Create a predicate function from a query value.
 *
 * @template T - Type of the value to test
 *
 * @param {any} filter - The query filter to create a predicate for
 * @param {FinnaContext} [ctx=createFinnaContext()] - Optional query context
 * @returns {FilterPredicate<T>} A predicate function for the given filter
 * @throws {AggregateError} If the query contains invalid or unregistered operators or invalid arguments.
 */
export function createPredicate<T = any>(filter: any, ctx: FinnaContext = createFinnaContext()): FilterPredicate<T> {
  return withCompilation(
    ctx,
    () => {
      if (isFn(filter)) {
        return ((actual: any, root?: any) => Boolean(filter(actual, root))) as FilterPredicate<T>;
      }

      if (isClass(filter, RegExp)) {
        return ((actual: any) => isStr(actual) && filter.test(actual)) as FilterPredicate<T>;
      }

      if (isClass(filter, Date)) {
        const t = filter.getTime();
        return ((actual: any) =>
          isClass(actual, Date) ? (actual as Date).getTime() === t : actual === t) as FilterPredicate<T>;
      }

      if (isOperatorObject(filter)) {
        const predicates = Object.entries(filter).map(([op, expected]) =>
          createOperatorPredicate(op as OperatorName, expected, childContext(ctx, op)),
        );
        return ((actual: any, root?: any) => predicates.every((p) => p(actual, root))) as FilterPredicate<T>;
      }

      if (isObj(filter) && !isClass(filter, Date) && !isClass(filter, RegExp)) {
        const entries = Object.entries(filter).map(
          ([key, subFilter]) => [key, createPredicate(subFilter, childContext(ctx, key))] as const,
        );
        return ((actual: any, root?: any) => {
          if (!isObj(actual) || isClass(actual, Date) || isClass(actual, RegExp)) {
            return false;
          }
          return entries.every(([key, subPredicate]) => {
            return subPredicate((actual as any)[key], root ?? actual);
          });
        }) as FilterPredicate<T>;
      }

      return ((actual: any) => isDeepEqual(actual, filter)) as FilterPredicate<T>;
    },
    (() => false) as unknown as FilterPredicate<T>,
  );
}

/**
 * Create a predicate for a specific operator.
 *
 * @template T
 * @param {string} operator - The operator string (e.g. '$eq', '$gt')
 * @param {any} expected - The expected value or nested filter
 * @param {FinnaContext} ctx - Query context
 * @returns {FilterPredicate<T>} A predicate function for the operator
 * @throws {AggregateError} If the query contains invalid or unregistered operators or invalid arguments.
 */
export function createOperatorPredicate<T = any>(
  operator: OperatorName,
  expected: any,
  ctx: FinnaContext,
): FilterPredicate<T> {
  return withCompilation(
    ctx,
    () => {
      const factory = getOperator(operator);
      if (!factory) throw new Error(`Invalid or unregistered query operator: ${operator}`);
      return factory(expected, ctx) as FilterPredicate<T>;
    },
    (() => false) as unknown as FilterPredicate<T>,
  );
}
