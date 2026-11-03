import { isArr } from "@fimbul-works/hvat";
import { createPredicate } from "../../predicate.js";
import type { FilterPredicate, FinnaContext } from "../../types.js";

/**
 * Creates a predicate requiring no requested values or matching items.
 *
 * @param expected - An array of excluded values, or a filter that no array item may match.
 * @param ctx - Compilation context shared with nested filters.
 * @returns A predicate that rejects non-arrays and requires no matching items.
 * @throws {AggregateError} If a nested filter is invalid when compiled outside another compilation.
 */
export function createNonePredicate(expected: any, ctx: FinnaContext): FilterPredicate {
  const predicate = isArr(expected) ? undefined : createPredicate(expected, ctx); // TODO: should predicate be undefined, or be: `() => false`?
  return ((actual: any, root?: any) => {
    if (!isArr(actual)) return false; // TODO?
    if (isArr(expected)) return expected.every((value: any) => actual.indexOf(value) === -1); // This is inverse of .all() - TODO: would this work better as a Set?
    return actual.every((item: any) => !predicate?.(item, root)); // This is inverse of .all()
  }) as FilterPredicate;
}
