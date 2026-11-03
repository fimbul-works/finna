import { isUndef } from "@fimbul-works/hvat";
import type { FilterPredicate, FinnaContext } from "../../types.js";

/**
 * Creates a predicate for the presence or absence of a value.
 *
 * @param expected - Whether a defined value is required; falsy values request undefined.
 * @param ctx - Compilation context, accepted for the common operator factory interface.
 * @returns A predicate testing whether the actual value is defined or undefined.
 */
export function createExistsPredicate(expected: any, _ctx: FinnaContext): FilterPredicate {
  return ((actual: any) => (expected ? !isUndef(actual) : isUndef(actual))) as FilterPredicate;
}
