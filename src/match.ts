import { compile } from "./compile.js";
import { createFinnaContext } from "./context.js";
import type { FinnaContext, Query } from "./types.js";

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
