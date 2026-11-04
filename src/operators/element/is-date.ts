import { isBool, isClass } from "@fimbul-works/hvat";
import type { FilterPredicate, OperatorFactory } from "../../types.js";

/** Creates a date check; false requests the inverse. */
export const createIsDatePredicate: OperatorFactory = (expected) => {
  if (!isBool(expected)) throw new TypeError("$isDate requires a boolean argument");
  const guard = (value: any) => isClass(value, Date);
  return ((actual: any) => guard(actual) === expected) as FilterPredicate;
};
