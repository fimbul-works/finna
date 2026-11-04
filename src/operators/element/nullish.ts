import { isNullish } from "@fimbul-works/hvat";
import type { FilterPredicate, FinnaContext } from "../../types.js";

/**
 * Creats a predicate for nullish values.
 *
 * @param expected - Unused, accepted for the common operator factory interface.
 * @param ctx - Compilation context, accepted for the common operator factory interface.
 * @returns A predicate checking whether the value is nullish.
 */
export function createNullishPredicate(_expected: any, _ctx: FinnaContext): FilterPredicate {
  return ((actual: any) => {
    return isNullish(actual);
  }) as FilterPredicate;
}
