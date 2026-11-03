import { isArr } from "@fimbul-works/hvat";
import type { FilterPredicate, FinnaContext } from "../../types.js";
import { isDeepEqual } from "../../util.js";

/**
 * Creates a predicate for excluded membership using deep equality.
 *
 * @param expected - An array of excluded values.
 * @param ctx - Compilation context, accepted for the common operator factory interface.
 * @returns A predicate that matches values not deeply equal to any excluded value.
 * @throws {TypeError} If expected is not an array.
 */
export function createNinPredicate(expected: any, _ctx: FinnaContext): FilterPredicate {
  if (!isArr(expected)) throw new TypeError("Operator $nin expects an array");
  return ((actual: any) => !expected.some((item: any) => isDeepEqual(actual, item))) as FilterPredicate;
}
