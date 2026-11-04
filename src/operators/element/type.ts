import {
  isArr,
  isBigInt,
  isBool,
  isClass,
  isFn,
  isInt,
  isNull,
  isNum,
  isObj,
  isStr,
  isSym,
  isUndef,
} from "@fimbul-works/hvat";
import type { FilterPredicate, FinnaContext, TypeString } from "../../types.js";

const typeGuards: Record<TypeString, (value: any) => boolean> = {
  string: isStr,
  number: isNum,
  boolean: isBool,
  array: isArr,
  object: (value) => isObj(value) && !isClass(value, Date),
  null: isNull,
  undefined: isUndef,
  date: (value) => isClass(value, Date),
  bigint: isBigInt,
  int: isInt,
  symbol: isSym,
  function: isFn,
};

/**
 * Creates a Hvat-backed type predicate, with array, date, null, and int extensions.
 * @param expected - A supported type name.
 * @param _ctx - Compilation context.
 * @returns A predicate checking the requested type.
 * @throws {TypeError} If the type name is unsupported.
 */
export function createTypePredicate(expected: any, _ctx: FinnaContext): FilterPredicate {
  if (!isStr(expected) || !Object.hasOwn(typeGuards, expected)) {
    throw new TypeError(`Unsupported $type: ${String(expected)}`);
  }
  return typeGuards[expected as TypeString] as FilterPredicate;
}
