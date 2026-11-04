import { isBool, isObj } from "@fimbul-works/hvat";
import type { FilterPredicate, OperatorFactory } from "../../types.js";

/** Creates a object check; false requests the inverse. */
export const createIsObjectPredicate: OperatorFactory = (expected) => {
  if (!isBool(expected)) throw new TypeError("$isObject requires a boolean argument");
  const guard = isObj;
  return ((actual: any) => guard(actual) === expected) as FilterPredicate;
};
