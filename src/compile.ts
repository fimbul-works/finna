import { isArr, isClass, isFn, isObj } from "@fimbul-works/hvat";
import { getAtPath } from "@fimbul-works/nested-path";
import { childContext, createFinnaContext, withCompilation } from "./context.js";
import { createPredicate } from "./predicate.js";
import type { FilterPredicate, FinnaContext, Query } from "./types.js";

/**
 * Compiles a query/pattern specification into an optimized, reusable predicate function.
 *
 * @template {Record<string, any>} T - Type of value to match
 * @param {Query<T>} pattern - The query/pattern specification to compile
 * @param {FinnaContext} [ctx=createFinnaContext()] - Optional query context
 * @returns {FilterPredicate<T>} A compiled predicate function `(value) => boolean`
 * @throws {AggregateError} If the query contains invalid or unregistered operators or invalid arguments.
 */
export function compile<T extends Record<string, any>>(
  pattern: Query<T>,
  ctx: FinnaContext = createFinnaContext(),
): FilterPredicate<T> {
  return withCompilation(
    ctx,
    () => {
      if (isFn(pattern)) {
        return ((value: T, root?: any) => !!pattern(value, root ?? value)) as FilterPredicate<T>;
      }

      if (
        !pattern ||
        !isObj(pattern) ||
        !isClass(pattern, Object) ||
        isClass(pattern, Array) ||
        isClass(pattern, Date) ||
        isClass(pattern, RegExp)
      ) {
        throw new TypeError("A query must be an object or predicate function");
      }

      const predicates = Object.entries(pattern).map(([key, filter]) => {
        const nested = childContext(ctx, key);
        // Logical operators
        if (key === "$and") {
          const predicates = compileLogicalArray<T>(filter, nested);
          return (value: T, root?: any) => predicates.every((m) => m(value, root ?? value));
        }
        if (key === "$or") {
          const predicates = compileLogicalArray<T>(filter, nested);
          return (value: T, root?: any) => predicates.some((m) => m(value, root ?? value));
        }
        if (key === "$not") {
          const predicate = compile<T>(filter as Query<T>, nested);
          return (value: T, root?: any) => !predicate(value, root ?? value);
        }
        if (key === "$nor") {
          const predicates = compileLogicalArray<T>(filter, nested);
          return (value: T, root?: any) => !predicates.some((m) => m(value, root ?? value));
        }

        // Field matching
        const predicate = createPredicate(filter, nested);
        // Query keys are runtime paths; nested-path's public types require literal paths.
        const readPath = getAtPath as (input: T, path: string) => unknown;
        return (value: T, root?: any) => predicate(readPath(value, key), root ?? value);
      });

      return ((value: T, root?: any) => predicates.every((f) => f(value, root ?? value))) as FilterPredicate<T>;
    },
    (() => false) as unknown as FilterPredicate<T>,
  );
}

/**
 * Compiles each branch of a logical array while collecting sibling errors.
 *
 * @param filter - The array of query branches to compile.
 * @param ctx - Compilation context at the logical operator location.
 * @returns Compiled branch predicates, or an empty array after a nested validation failure.
 * @throws {AggregateError} If called as an outermost compilation with invalid branches.
 */
function compileLogicalArray<T extends Record<string, any>>(filter: any, ctx: FinnaContext): FilterPredicate<T>[] {
  return withCompilation(ctx, () => {
    if (!isArr<T>(filter)) throw new TypeError("Logical operator expects an array of queries");
    return filter.map((query, index) => compile<T>(query, childContext(ctx, index)));
  }, []);
}

/**
 * Checks if a value satisfies a query/pattern specification.
 *
 * @template {Record<string, any>} T - Type of value to match
 * @param {T} value - The target value to test
 * @param {Query<T>} pattern - The query/pattern to match against
 * @param {FinnaContext} [ctx=createFinnaContext()] - Optional query context
 * @returns {value is T} `true` if the value matches, `false` otherwise
 * @throws {AggregateError} If the query contains invalid or unregistered operators or invalid arguments.
 */
export function match<T extends Record<string, any>>(
  value: T,
  pattern: Query<T>,
  ctx: FinnaContext = createFinnaContext(),
): value is T {
  return compile(pattern, ctx)(value, value);
}
