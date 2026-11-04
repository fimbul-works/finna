import { isClass, isConstructor } from "@fimbul-works/hvat";
import type { FilterPredicate, OperatorFactory } from "../../types.js";

/** Creates an instanceof check using a Hvat-validated constructor. */
export const createIsClassPredicate: OperatorFactory = (expected) => {
  if (!isConstructor(expected)) throw new TypeError("$isClass requires a constructor");
  return ((actual: any) => isClass(actual, expected)) as FilterPredicate;
};
