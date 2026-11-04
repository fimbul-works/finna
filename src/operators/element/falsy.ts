import { isFalsy } from "@fimbul-works/hvat";
import type { FilterPredicate, FinnaContext } from "../../types.js";

/**
 * Creates a predicate for falsy values.
 *
 * @param expected - Unused, accepted for the common operator factory interface.
 * @param ctx - Compilation context, accepted for the common operator factory interface.
 * @returns A predicate checking whether the value is falsy.
 */
export function createFalsyPredicate(_expected: any, _ctx: FinnaContext): FilterPredicate {
  return ((actual: any) => {
    return isFalsy(actual);
  }) as FilterPredicate;
}
