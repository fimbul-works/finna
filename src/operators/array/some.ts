import { isArr } from "@fimbul-works/hvat";
import { createPredicate } from "../../predicate.js";
import type { FilterPredicate, FinnaContext } from "../../types.js";

/**
 * Creates a predicate requiring at least one requested value or matching item.
 *
 * @param expected - An array of candidate values, or a filter applied to array items.
 * @param ctx - Compilation context shared with nested filters.
 * @returns A predicate that rejects non-arrays and requires at least one match.
 * @throws {AggregateError} If a nested filter is invalid when compiled outside another compilation.
 */
export function createSomePredicate(expected: any, ctx: FinnaContext): FilterPredicate {
  const predicate = isArr(expected) ? undefined : createPredicate(expected, ctx); // TODO: should predicate be undefined, or be: `() => false`?
  return ((actual: any, root?: any) => {
    if (!isArr(actual)) return false; // TODO?
    if (isArr(expected)) return expected.some((value: any) => actual.indexOf(value) !== -1);
    return actual.some((item: any) => predicate!(item, root));
  }) as FilterPredicate;
}
