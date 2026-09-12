import { getAtPath } from "@fimbul-works/nested-path";
import { QUERY_AND, QUERY_NOR, QUERY_NOT, QUERY_OR } from "./constants.js";
import { createFinnaContext } from "./context.js";
import { createPredicate } from "./predicate.js";
import type { FinnaContext, Predicate, Query } from "./types.js";

function isQueryContext(val: unknown): val is FinnaContext {
  return (
    val !== null &&
    typeof val === "object" &&
    typeof (val as FinnaContext).useUTC === "boolean" &&
    (val as FinnaContext).warnings instanceof Set
  );
}

/**
 * Compiles a query/pattern specification into an optimized, reusable predicate function.
 *
 * @template {Record<string, any>} T - Type of value to match
 * @param {Query<T>} pattern - The query/pattern specification to compile
 * @param {FinnaContext} [ctx=createQueryContext()] - Optional query context
 * @returns {Predicate<T>} A compiled predicate function `(value) => boolean`
 */
export function compile<T extends Record<string, any>>(
  pattern: Query<T>,
  ctx: FinnaContext = createFinnaContext(),
): Predicate<T> {
  const predicates = Object.entries(pattern).map(([key, filter]) => {
    // Logical operators
    if (key === QUERY_AND) {
      const predicates = (filter as Query<T>[]).map((q) => compile<T>(q, ctx));
      return (value: T, root?: T) => predicates.every((m) => m(value, root));
    }
    if (key === QUERY_OR) {
      const predicates = (filter as Query<T>[]).map((q) => compile<T>(q, ctx));
      return (value: T, root?: T) => predicates.some((m) => m(value, root));
    }
    if (key === QUERY_NOT) {
      const predicate = compile<T>(filter as Query<T>, ctx);
      return (value: T, root?: T) => !predicate(value, root);
    }
    if (key === QUERY_NOR) {
      const predicates = (filter as Query<T>[]).map((q) => compile<T>(q, ctx));
      return (value: T, root?: T) => !predicates.some((m) => m(value, root));
    }

    // Field matching
    const predicate = createPredicate(filter, ctx);
    return (value: T, root?: any) => predicate(getAtPath(value, key), root ?? value);
  });

  return ((value: T, root?: any) => predicates.every((f) => f(value, root ?? value))) as Predicate<T>;
}

/**
 * Checks if a value satisfies a query/pattern specification.
 *
 * @template {Record<string, any>} T - Type of value to match
 * @param {T} value - The target value to test
 * @param {Query<T>} pattern - The query/pattern to match against
 * @param {FinnaContext} [ctx=createQueryContext()] - Optional query context
 * @returns {value is T} `true` if the value matches, `false` otherwise
 */
export function match<T extends Record<string, any>>(
  value: T,
  pattern: Query<T>,
  ctx: FinnaContext = createFinnaContext(),
): value is T {
  return compile(pattern, ctx)(value, value);
}

/**
 * Compiles a query/pattern specification into an optimized, reusable predicate function.
 * Shorthand method for `compile()`.
 *
 * @template {Record<string, any>} T - Type of value to match
 * @param {Query<T>} pattern - The query/pattern specification to compile
 * @param {FinnaContext} [ctx=createQueryContext()] - Optional query context
 * @returns {Predicate<T>} A compiled predicate function `(value) => boolean`
 */
export function finna<T extends Record<string, any>>(pattern: Query<T>, ctx?: FinnaContext): Predicate<T>;

/**
 * Checks if a value satisfies a query/pattern specification.
 * Shorthand method for `match()`.
 *
 * @template {Record<string, any>} T - Type of value to match
 * @param {T} value - The target value to test
 * @param {Query<T>} pattern - The query/pattern to match against
 * @param {FinnaContext} [ctx=createQueryContext()] - Optional query context
 * @returns {value is T} `true` if the value matches, `false` otherwise
 */
export function finna<T extends Record<string, any>>(value: T, pattern: Query<T>, ctx?: FinnaContext): value is T;

export function finna(...args: any[]) {
  const [arg1, arg2, arg3] = args;
  if (args.length === 1 || (args.length === 2 && isQueryContext(arg2))) {
    return compile(arg1, arg2);
  }
  return match(arg1, arg2, arg3);
}
