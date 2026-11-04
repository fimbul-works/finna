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
  if (isArr(expected)) {
    return ((actual: any) =>
      isArr(actual) && expected.every((value: any) => actual.indexOf(value) === -1)) as FilterPredicate;
  }
  const predicate = createPredicate(expected, ctx);
  return ((actual: any, root?: any) =>
    isArr(actual) && actual.every((item: any) => !predicate(item, root))) as FilterPredicate;
}
