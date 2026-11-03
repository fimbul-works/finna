import { isArr, isBigInt, isClass, isInt, isNull, isObj, isUndef } from "@fimbul-works/hvat";
import type { FilterPredicate, FinnaContext } from "../../types.js";

/**
 * Creates a predicate for a JavaScript value type.
 *
 * @param expected - The requested type name, including array, date, null, and undefined.
 * @param ctx - Compilation context, accepted for the common operator factory interface.
 * @returns A predicate checking the requested type.
 */
export function createTypePredicate(expected: any, _ctx: FinnaContext): FilterPredicate {
  return ((actual: any) => {
    if (expected === "array") return isArr(actual);
    if (expected === "bigint") return isBigInt(actual);
    if (expected === "date") return isClass(actual, Date);
    if (expected === "int") return isInt(actual);
    if (expected === "null") return isNull(actual);
    if (expected === "object") return isObj(actual) && !isClass(actual, Date);
    if (expected === "undefined") return isUndef(actual);
    return typeof actual === expected;
  }) as FilterPredicate;
}
