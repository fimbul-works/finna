import { getAtPath } from "@fimbul-works/nested-path";
import { QUERY_AND, QUERY_NOR, QUERY_NOT, QUERY_OR } from "./constants.js";
import { createPredicate } from "./predicate.js";
import { createQueryContext } from "./query-context.js";
import type { Predicate, Query, QueryContext } from "./types.js";

/**
 * Compiles a predicate function from a query object.
 * The returned function can be used to test values efficiently.
 *
 * @template {Record<string, any>} T - Type to check
 * @param {Query<T>} query - The query to compile into a matcher
 * @param {QueryContext} [ctx=createQueryContext()] - Optional query context
 * @returns {Predicate<T>} A query predicate function
 */
export function compileQuery<T extends Record<string, any>>(
  query: Query<T>,
  ctx: QueryContext = createQueryContext(),
): Predicate<T> {
  const predicates = Object.entries(query).map(([key, filter]) => {
    // Logical operators
    if (key === QUERY_AND) {
      const predicates = (filter as Query<T>[]).map((q) => compileQuery<T>(q, ctx));
      return (doc: T) => predicates.every((m) => m(doc));
    }
    if (key === QUERY_OR) {
      const predicates = (filter as Query<T>[]).map((q) => compileQuery<T>(q, ctx));
      return (doc: T) => predicates.some((m) => m(doc));
    }
    if (key === QUERY_NOT) {
      const predicate = compileQuery<T>(filter as Query<T>, ctx);
      return (doc: T) => !predicate(doc);
    }
    if (key === QUERY_NOR) {
      const predicates = (filter as Query<T>[]).map((q) => compileQuery<T>(q, ctx));
      return (doc: T) => !predicates.some((m) => m(doc));
    }

    // Field matching
    const predicate = createPredicate(filter, ctx);
    return (value: T, root?: any) => {
      const targetValue = root ?? value;
      const actual = getAtPath(value, key);
      return predicate(actual, targetValue);
    };
  });

  return (value: T, root?: any) => {
    const targetValue = root ?? value;
    return predicates.every((f) => f(value, targetValue));
  };
}

/**
 * Checks if the given query matches.
 *
 * @template {Record<string, any>} T - Type to check
 * @param {T} value - The value to check
 * @param {Query<T>} q - The query to match against
 * @param {QueryContext} [ctx=createQueryContext()] - Optional query context
 * @returns {boolean} `true` if the value matches, `false` otherwise
 */
export function query<T extends Record<string, any>>(
  value: T,
  q: Query<T>,
  ctx: QueryContext = createQueryContext(),
): boolean {
  return compileQuery(q, ctx)(value, value);
}
