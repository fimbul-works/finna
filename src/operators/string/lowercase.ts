import { isStr } from "@fimbul-works/hvat";
import { createPredicate } from "../../predicate.js";
import type { FilterPredicate, FinnaContext } from "../../types.js";

/**
 * Tests a temporary lowercase string without changing the input or root document.
 * @param expected - Predicate or nested query applied to the transformed string.
 * @param ctx - Compilation context shared with the nested query.
 * @returns A predicate rejecting non-strings and testing the transformed string.
 */
export function createLowercasePredicate(expected: any, ctx: FinnaContext): FilterPredicate {
  const predicate = createPredicate(expected, ctx);
  return ((actual: any, root?: any) => isStr(actual) && predicate(actual.toLowerCase(), root)) as FilterPredicate;
}
