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
  if (isArr(expected)) {
    return ((actual: any) =>
      isArr(actual) && expected.every((value: any) => actual.indexOf(value) !== -1)) as FilterPredicate;
  }
  const predicate = createPredicate(expected, ctx);
  return ((actual: any, root?: any) =>
    isArr(actual) && actual.every((item: any) => predicate(item, root))) as FilterPredicate;
}
