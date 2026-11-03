import { isArr, isNum } from "@fimbul-works/hvat";
import { createPredicate } from "../../predicate.js";
import type { FilterPredicate, FinnaContext } from "../../types.js";

/**
 * Creates a predicate for an array's length.
 *
 * @param expected - An exact length, or a filter applied to the array length.
 * @param ctx - Compilation context shared with nested filters.
 * @returns A predicate that rejects non-arrays and tests their length.
 * @throws {AggregateError} If a nested filter is invalid when compiled outside another compilation.
 */
export function createSizePredicate(expected: any, ctx: FinnaContext): FilterPredicate {
  const predicate = isNum(expected) ? (size: number, _root?: any) => size === expected : createPredicate(expected, ctx);
  return ((actual: any, root?: any) => isArr(actual) && predicate(actual.length, root)) as FilterPredicate;
}
