import { isStr } from "@fimbul-works/hvat";
import type { FilterPredicate, FinnaContext } from "../../types.js";
import { fieldReference } from "../field-reference.js";

/**
 * Creates a predicate requiring a string that ends with the expected text.
 *
 * @param expected - Text or a $field reference whose resolved value is converted to a string.
 * @param ctx - Compilation context, accepted for the common operator factory interface.
 * @returns A predicate that rejects non-strings and checks whether the string ends with the resolved text.
 */
export function createEndsWithPredicate(expected: any, _ctx: FinnaContext): FilterPredicate {
  return ((actual: any, root?: any) =>
    isStr(actual) && actual.endsWith(String(fieldReference(expected, root)))) as FilterPredicate;
}
