import { isArr, isBool } from "@fimbul-works/hvat";
import type { FilterPredicate, OperatorFactory } from "../../types.js";

/** Creates a array check; false requests the inverse. */
export const createIsArrayPredicate: OperatorFactory = (expected) => {
  if (!isBool(expected)) throw new TypeError("$isArray requires a boolean argument");
  const guard = isArr;
  return ((actual: any) => guard(actual) === expected) as FilterPredicate;
};
