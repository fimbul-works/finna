import { isArr } from "@fimbul-works/hvat";
import { createPredicate } from "../../predicate.js";
import type { FilterPredicate, FinnaContext } from "../../types.js";

/**
 * Creates a predicate requiring all requested values or every item to match.
 *
 * @param expected - An array of required values, or a filter applied to every array item.
 * @param ctx - Compilation context shared with nested filters.
 * @returns A predicate that rejects non-arrays and checks membership or every item.
 * @throws {AggregateError} If a nested filter is invalid when compiled outside another compilation.
 */
export function createAllPredicate(expected: any, ctx: FinnaContext): FilterPredicate {
  const predicate = isArr(expected) ? undefined : createPredicate(expected, ctx); // TODO: should predicate be undefined, or be: `() => false`?
  return ((actual: any, root?: any) => {
    if (!isArr(actual)) return false; // TODO?
    if (isArr(expected)) return expected.every((value: any) => actual.indexOf(value) !== -1); // TODO: would this work better as a Set?
    return actual.every((item: any) => predicate?.(item, root));
  }) as FilterPredicate;
}
