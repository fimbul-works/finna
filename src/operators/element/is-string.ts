import { isBool, isStr } from "@fimbul-works/hvat";
import type { FilterPredicate, OperatorFactory } from "../../types.js";

/** Creates a string check; false requests the inverse. */
export const createIsStringPredicate: OperatorFactory = (expected) => {
  if (!isBool(expected)) throw new TypeError("$isString requires a boolean argument");
  const guard = isStr;
  return ((actual: any) => guard(actual) === expected) as FilterPredicate;
};
