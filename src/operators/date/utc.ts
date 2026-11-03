import { createPredicate } from "../../predicate.js";
import type { FilterPredicate, FinnaContext } from "../../types.js";

/**
 * Creates a nested predicate using UTC date components.
 *
 * @param expected - A nested date filter compiled with UTC enabled.
 * @param ctx - Compilation context shared with nested filters.
 * @returns A predicate evaluating the nested filter with UTC date operations.
 * @throws {AggregateError} If a nested filter is invalid when compiled outside another compilation.
 */
export function createUtcPredicate(expected: any, ctx: FinnaContext): FilterPredicate {
  return createPredicate(expected, { ...ctx, useUTC: true });
}
