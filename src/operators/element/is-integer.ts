import { isBool, isInt } from "@fimbul-works/hvat";
import type { FilterPredicate, OperatorFactory } from "../../types.js";

/** Creates a integer check; false requests the inverse. */
export const createIsIntegerPredicate: OperatorFactory = (expected) => {
  if (!isBool(expected)) throw new TypeError("$isInteger requires a boolean argument");
  const guard = isInt;
  return ((actual: any) => guard(actual) === expected) as FilterPredicate;
};
