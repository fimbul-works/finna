import { isClass, isNum } from "@fimbul-works/hvat";
import { createPredicate } from "../../predicate.js";
import type { FilterPredicate, FinnaContext } from "../../types.js";

/**
 * Creates a predicate for the full year of a date or timestamp.
 *
 * @param expected - An exact component value, or a filter applied to the extracted component.
 * @param ctx - Compilation context; useUTC selects UTC rather than local date components.
 * @returns A predicate that rejects invalid dates and non-date values, and tests the date component.
 * @throws {AggregateError} If a nested filter is invalid when compiled outside another compilation.
 */
export function createYearPredicate(expected: any, ctx: FinnaContext): FilterPredicate {
  const predicate = isNum(expected)
    ? (value: number, _root?: any) => value === expected
    : createPredicate(expected, ctx);
  const useUTC = ctx.useUTC;
  return ((actual: any, root?: any) => {
    const date = isClass(actual, Date) ? actual : isNum(actual) ? new Date(actual) : undefined;
    if (!date || Number.isNaN(date.getTime())) return false;
    return predicate(useUTC ? date.getUTCFullYear() : date.getFullYear(), root);
  }) as FilterPredicate;
}
