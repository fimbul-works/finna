import { isArr } from "@fimbul-works/hvat";
import type { FilterPredicate, FinnaContext } from "../../types.js";
import { isDeepEqual } from "../../util.js";

/**
 * Creates a predicate for membership using deep equality.
 *
 * @param expected - An array of allowed values.
 * @param ctx - Compilation context, accepted for the common operator factory interface.
 * @returns A predicate that matches a value deeply equal to at least one allowed value.
 * @throws {TypeError} If expected is not an array.
 */
export function createInPredicate(expected: any, _ctx: FinnaContext): FilterPredicate {
  if (!isArr(expected)) throw new TypeError("Operator $in expects an array");
  return ((actual: any) => expected.some((item: any) => isDeepEqual(actual, item))) as FilterPredicate;
}
