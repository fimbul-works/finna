import type { FilterPredicate, FinnaContext } from "../../types.js";
import { fieldReference } from "../field-reference.js";

/**
 * Creates a predicate requiring the actual value to be less than the expected value.
 *
 * @param expected - A comparison value or a $field reference resolved against the root value.
 * @param ctx - Compilation context, accepted for the common operator factory interface.
 * @returns A predicate testing whether the actual value is less than the resolved value.
 */
export function createLtPredicate(expected: any, _ctx: FinnaContext): FilterPredicate {
  return ((actual: any, root?: any) => actual < fieldReference(expected, root)) as FilterPredicate;
}
