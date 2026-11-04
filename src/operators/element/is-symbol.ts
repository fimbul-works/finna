import { isBool, isSym } from "@fimbul-works/hvat";
import type { FilterPredicate, OperatorFactory } from "../../types.js";

/** Creates a symbol check; false requests the inverse. */
export const createIsSymbolPredicate: OperatorFactory = (expected) => {
  if (!isBool(expected)) throw new TypeError("$isSymbol requires a boolean argument");
  const guard = isSym;
  return ((actual: any) => guard(actual) === expected) as FilterPredicate;
};
