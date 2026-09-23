import { getAtPath } from "@fimbul-works/nested-path";
import { createFinnaContext } from "./context.js";
import { createPredicate } from "./predicate.js";
import type { FilterPredicate, FinnaContext, Query } from "./types.js";

/**
 * Compiles a query/pattern specification into an optimized, reusable predicate function.
 *
 * @template {Record<string, any>} T - Type of value to match
 * @param {Query<T>} pattern - The query/pattern specification to compile
 * @param {FinnaContext} [ctx=createFinnaContext()] - Optional query context
 * @returns {FilterPredicate<T>} A compiled predicate function `(value) => boolean`
 */
export function compile<T extends Record<string, any>>(
  pattern: Query<T>,
  ctx: FinnaContext = createFinnaContext(),
): FilterPredicate<T> {
  if (typeof pattern === "function") {
    return ((value: T, root?: any) => !!pattern(value, root ?? value)) as FilterPredicate<T>;
  }

  const predicates = Object.entries(pattern).map(([key, filter]) => {
    // Logical operators
    if (key === "$and") {
      const predicates = (filter as Query<T>[]).map((q) => compile<T>(q, ctx));
      return (value: T, root?: any) => predicates.every((m) => m(value, root ?? value));
    }
    if (key === "$or") {
      const predicates = (filter as Query<T>[]).map((q) => compile<T>(q, ctx));
      return (value: T, root?: any) => predicates.some((m) => m(value, root ?? value));
    }
    if (key === "$not") {
      const predicate = compile<T>(filter as Query<T>, ctx);
      return (value: T, root?: any) => !predicate(value, root ?? value);
    }
    if (key === "$nor") {
      const predicates = (filter as Query<T>[]).map((q) => compile<T>(q, ctx));
      return (value: T, root?: any) => !predicates.some((m) => m(value, root ?? value));
    }

    // Field matching
    const predicate = createPredicate(filter, ctx);
    return (value: T, root?: any) => predicate(getAtPath(value, key), root ?? value);
  });

  return ((value: T, root?: any) => predicates.every((f) => f(value, root ?? value))) as FilterPredicate<T>;
}

/**
 * Checks if a value satisfies a query/pattern specification.
 *
 * @template {Record<string, any>} T - Type of value to match
 * @param {T} value - The target value to test
 * @param {Query<T>} pattern - The query/pattern to match against
 * @param {FinnaContext} [ctx=createFinnaContext()] - Optional query context
 * @returns {value is T} `true` if the value matches, `false` otherwise
 */
export function match<T extends Record<string, any>>(
  value: T,
  pattern: Query<T>,
  ctx: FinnaContext = createFinnaContext(),
): value is T {
  return compile(pattern, ctx)(value, value);
}
