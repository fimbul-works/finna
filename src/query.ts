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
      return (value: T, root?: T) => predicates.every((m) => m(value, root));
    }
    if (key === QUERY_OR) {
      const predicates = (filter as Query<T>[]).map((q) => compileQuery<T>(q, ctx));
      return (value: T, root?: T) => predicates.some((m) => m(value, root));
    }
    if (key === QUERY_NOT) {
      const predicate = compileQuery<T>(filter as Query<T>, ctx);
      return (value: T, root?: T) => !predicate(value, root);
    }
    if (key === QUERY_NOR) {
      const predicates = (filter as Query<T>[]).map((q) => compileQuery<T>(q, ctx));
      return (value: T, root?: T) => !predicates.some((m) => m(value, root));
    }

    // Field matching
    const predicate = createPredicate(filter, ctx);
    return (value: T, root?: any) => predicate(getAtPath(value, key), root ?? value);
  });

  return ((value: T, root?: any) => predicates.every((f) => f(value, root ?? value))) as Predicate<T>;
}

/**
 * Checks if the given query matches.
 *
 * @template {Record<string, any>} T - Type to check
 * @param {T} value - The value to check
 * @param {Query<T>} q - The query to match against
 * @param {QueryContext} [ctx=createQueryContext()] - Optional query context
 * @returns {value is T} `true` if the value matches, `false` otherwise
 */
export function query<T extends Record<string, any>>(
  value: T,
  q: Query<T>,
  ctx: QueryContext = createQueryContext(),
): value is T {
  return compileQuery(q, ctx)(value, value);
}
