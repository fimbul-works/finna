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
  if (isArr(expected)) {
    return ((actual: any) =>
      isArr(actual) && expected.some((value: any) => actual.indexOf(value) !== -1)) as FilterPredicate;
  }
  const predicate = createPredicate(expected, ctx);
  return ((actual: any, root?: any) =>
    isArr(actual) && actual.some((item: any) => predicate(item, root))) as FilterPredicate;
}
