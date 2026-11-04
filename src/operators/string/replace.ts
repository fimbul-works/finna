import { isClass, isObj, isStr } from "@fimbul-works/hvat";
import { childContext } from "../../context.js";
import { createPredicate } from "../../predicate.js";
import type { FieldReference, FilterPredicate, FinnaContext } from "../../types.js";
import { fieldReference } from "../field-reference.js";

/**
 * Replaces matches using JavaScript replace semantics and tests the temporary string.
 * @param expected - Search, replacement, and required then predicate; arguments may reference root fields.
 * @param ctx - Compilation context shared with the then predicate.
 * @returns A predicate rejecting non-strings and invalid resolved arguments.
 * @throws {TypeError} If literal arguments are invalid or then is missing.
 */
export function createReplacePredicate(expected: any, ctx: FinnaContext): FilterPredicate {
  if (!isObj<Record<string, any>>(expected) || !Object.hasOwn(expected, "then")) {
    throw new TypeError("$replace requires { search, replace, then }");
  }
  const { search, replace } = expected;
  const searchReference = isObj<FieldReference>(search) && isStr(search.$field);
  const replaceReference = isObj<FieldReference>(replace) && isStr(replace.$field);
  if (!searchReference && !isStr(search) && !isClass(search, RegExp)) {
    throw new TypeError("$replace.search requires a string, RegExp, or $field reference");
  }
  if (!replaceReference && !isStr(replace)) {
    throw new TypeError("$replace.replace requires a string or $field reference");
  }
  const predicate = createPredicate(expected.then, childContext(ctx, "then"));
  return ((actual: any, root?: any) => {
    if (!isStr(actual)) return false;
    const resolvedSearch: unknown = searchReference ? fieldReference(search, root) : search;
    const resolvedReplace: unknown = replaceReference ? fieldReference(replace, root) : replace;
    if ((!isStr(resolvedSearch) && !isClass(resolvedSearch, RegExp)) || !isStr(resolvedReplace)) return false;
    // A fresh regex makes repeated evaluations independent of caller-owned lastIndex.
    const pattern = isClass(resolvedSearch, RegExp)
      ? new RegExp(resolvedSearch.source, resolvedSearch.flags)
      : resolvedSearch;
    return predicate(actual.replace(pattern, resolvedReplace), root);
  }) as FilterPredicate;
}
