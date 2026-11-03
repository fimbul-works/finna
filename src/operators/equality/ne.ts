import type { FilterPredicate, FinnaContext } from "../../types.js";
import { isDeepEqual } from "../../util.js";
import { fieldReference } from "../field-reference.js";

/**
 * Creates a predicate for deep inequality.
 *
 * @param expected - A literal value or a $field reference resolved against the root value.
 * @param ctx - Compilation context, accepted for the common operator factory interface.
 * @returns A predicate that matches values that are not deeply equal.
 */
export function createNePredicate(expected: any, _ctx: FinnaContext): FilterPredicate {
  return ((actual: any, root?: any) => !isDeepEqual(actual, fieldReference(expected, root))) as FilterPredicate;
}
