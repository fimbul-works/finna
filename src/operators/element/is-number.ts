import { isBool, isNum } from "@fimbul-works/hvat";
import type { FilterPredicate, OperatorFactory } from "../../types.js";

/** Creates a number check; false requests the inverse. */
export const createIsNumberPredicate: OperatorFactory = (expected) => {
  if (!isBool(expected)) throw new TypeError("$isNumber requires a boolean argument");
  const guard = isNum;
  return ((actual: any) => guard(actual) === expected) as FilterPredicate;
};
