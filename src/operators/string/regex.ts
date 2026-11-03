import { isClass, isStr } from "@fimbul-works/hvat";
import type { FilterPredicate, FinnaContext } from "../../types.js";

/**
 * Creates a predicate matching strings against a regular expression.
 *
 * @param expected - A RegExp instance or a value converted to a regular expression source string.
 * @param ctx - Compilation context, accepted for the common operator factory interface.
 * @returns A predicate that rejects non-strings and tests the regular expression.
 * @throws {SyntaxError} If the regular expression source is invalid.
 */
export function createRegexPredicate(expected: any, _ctx: FinnaContext): FilterPredicate {
  const re = isClass(expected, RegExp) ? expected : new RegExp(String(expected));
  return ((actual: any) => isStr(actual) && re.test(actual)) as FilterPredicate;
}
