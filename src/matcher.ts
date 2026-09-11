import { getAtPath } from "@fimbul-works/nested-path";
import { createPredicate, createQueryContext } from "./predicate.js";
import type { Predicate, Query, QueryContext } from "./types.js";

/**
 * Creates a matcher function for the given query.
 * The returned function can be used to test values efficiently.
 *
 * @template {Record<string, any>} T - Type to check
 * @param {Query<T>} query - The query to compile into a matcher
 * @param {QueryContext | boolean} [contextOrUTC=false] - Query context or useUTC flag
 * @returns {Predicate<T>} A matcher function
 */
export function createMatcher<T extends Record<string, any>>(
  query: Query<T>,
  contextOrUTC: QueryContext | boolean = false,
): Predicate<T> {
  const context =
    typeof contextOrUTC === "boolean" ? createQueryContext(contextOrUTC) : (contextOrUTC ?? createQueryContext(false));

  const filters = Object.entries(query).map(([key, filter]) => {
    // Logical operators
    if (key === "$and") {
      const matchers = (filter as Query<T>[]).map((q) => createMatcher<T>(q, context));
      return (doc: T) => matchers.every((m) => m(doc));
    }
    if (key === "$or") {
      const matchers = (filter as Query<T>[]).map((q) => createMatcher<T>(q, context));
      return (doc: T) => matchers.some((m) => m(doc));
    }
    if (key === "$nor") {
      const matchers = (filter as Query<T>[]).map((q) => createMatcher<T>(q, context));
      return (doc: T) => !matchers.some((m) => m(doc));
    }
    if (key === "$not") {
      const matcher = createMatcher<T>(filter as Query<T>, context);
      return (doc: T) => !matcher(doc);
    }

    // Field matching
    const predicate = createPredicate(filter, context);
    return (doc: T, root?: any) => {
      const targetDoc = root ?? doc;
      const actual = getAtPath(doc, key);
      return predicate(actual, targetDoc);
    };
  });

  return (doc: T, root?: any) => {
    const targetDoc = root ?? doc;
    return filters.every((f) => f(doc, targetDoc));
  };
}

/**
 * Checks if the given query matches.
 *
 * @template {Record<string, any>} T - Type to check
 * @param {T} value - The value to check
 * @param {Query<T>} query - The query to match against
 * @returns {boolean} `true` if the value matches, `false` otherwise
 */
export function matches<T extends Record<string, any>>(value: T, query: Query<T>): boolean {
  return createMatcher(query)(value, value);
}
