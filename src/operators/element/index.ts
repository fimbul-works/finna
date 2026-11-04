import type { ElementOperator, FilterPredicate, FinnaContext, OperatorFactory } from "../../types.js";
import { registerOperators } from "../operator-registry.js";
import { createExistsPredicate } from "./exists.js";
import { createFalsyPredicate } from "./falsy.js";
import { createIsArrayPredicate } from "./is-array.js";
import { createIsClassPredicate } from "./is-class.js";
import { createIsDatePredicate } from "./is-date.js";
import { createIsIntegerPredicate } from "./is-integer.js";
import { createIsNumberPredicate } from "./is-number.js";
import { createIsObjectPredicate } from "./is-object.js";
import { createIsStringPredicate } from "./is-string.js";
import { createIsSymbolPredicate } from "./is-symbol.js";
import { createNullishPredicate } from "./nullish.js";
import { createTruthyPredicate } from "./truthy.js";
import { createTypePredicate } from "./type.js";

export * from "./exists.js";
export * from "./falsy.js";
export * from "./is-array.js";
export * from "./is-class.js";
export * from "./is-date.js";
export * from "./is-integer.js";
export * from "./is-number.js";
export * from "./is-object.js";
export * from "./is-string.js";
export * from "./is-symbol.js";
export * from "./nullish.js";
export * from "./truthy.js";
export * from "./type.js";

export const elementOperators: ReadonlyMap<ElementOperator, OperatorFactory> = new Map<
  ElementOperator,
  OperatorFactory
>([
  ["$isNumber", createIsNumberPredicate],
  ["$isString", createIsStringPredicate],
  ["$isInteger", createIsIntegerPredicate],
  ["$isObject", createIsObjectPredicate],
  ["$isArray", createIsArrayPredicate],
  ["$isDate", createIsDatePredicate],
  ["$isSymbol", createIsSymbolPredicate],
  ["$isClass", createIsClassPredicate],
  ["$exists", createExistsPredicate],
  ["$falsy", createFalsyPredicate],
  ["$nullish", createNullishPredicate],
  ["$truthy", createTruthyPredicate],
  ["$type", createTypePredicate],
]);

/**
 * Creates a predicate using a built-in element factory without registering it.
 *
 * @param operator - The element operator to compile.
 * @param expected - The operator argument or nested filter.
 * @param ctx - Compilation context shared with the selected factory.
 * @returns The compiled predicate returned by the selected factory.
 * @throws {Error} If operator is not a built-in element operator, or its factory rejects the argument.
 */
export function createElementPredicate(operator: ElementOperator, expected: any, ctx: FinnaContext): FilterPredicate {
  const factory = elementOperators.get(operator);
  if (!factory) throw new Error(`Invalid element query operator: ${operator}`);
  return factory(expected, ctx);
}

/**
 * Registers all built-in element operators atomically.
 *
 * @returns An idempotent cleanup function removing only operators installed by this call.
 * @throws {Error} If an operator name is already registered with a different factory.
 */
export const registerElementOperators = (): (() => void) => registerOperators(elementOperators);
