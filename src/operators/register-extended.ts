import type { OperatorFactory, OperatorName } from "../types.js";
import { createFalsyPredicate } from "./element/falsy.js";
import { createIsArrayPredicate } from "./element/is-array.js";
import { createIsClassPredicate } from "./element/is-class.js";
import { createIsDatePredicate } from "./element/is-date.js";
import { createIsIntegerPredicate } from "./element/is-integer.js";
import { createIsNumberPredicate } from "./element/is-number.js";
import { createIsObjectPredicate } from "./element/is-object.js";
import { createIsStringPredicate } from "./element/is-string.js";
import { createIsSymbolPredicate } from "./element/is-symbol.js";
import { createNullishPredicate } from "./element/nullish.js";
import { createTruthyPredicate } from "./element/truthy.js";
import { registerOperators } from "./operator-registry.js";
import { createEndsWithPredicate } from "./string/endsWith.js";
import { createIncludesPredicate } from "./string/includes.js";
import { createLowercasePredicate } from "./string/lowercase.js";
import { createReplacePredicate } from "./string/replace.js";
import { createReplaceAllPredicate } from "./string/replaceAll.js";
import { createStartsWithPredicate } from "./string/startsWith.js";
import { createUppercasePredicate } from "./string/uppercase.js";

/** Additional element checks and string matching and transformation operators. */
export const extendedOperators: ReadonlyMap<OperatorName, OperatorFactory> = new Map<OperatorName, OperatorFactory>([
  ["$falsy", createFalsyPredicate],
  ["$nullish", createNullishPredicate],
  ["$truthy", createTruthyPredicate],
  ["$isArray", createIsArrayPredicate],
  ["$isClass", createIsClassPredicate],
  ["$isDate", createIsDatePredicate],
  ["$isInteger", createIsIntegerPredicate],
  ["$isNumber", createIsNumberPredicate],
  ["$isObject", createIsObjectPredicate],
  ["$isString", createIsStringPredicate],
  ["$isSymbol", createIsSymbolPredicate],
  ["$startsWith", createStartsWithPredicate],
  ["$endsWith", createEndsWithPredicate],
  ["$includes", createIncludesPredicate],
  ["$uppercase", createUppercasePredicate],
  ["$lowercase", createLowercasePredicate],
  ["$replace", createReplacePredicate],
  ["$replaceAll", createReplaceAllPredicate],
]);

/**
 * Registers extended element and string operations; basic operators remain opt-in.
 * Nested queries also require registration of any operators they use.
 * @returns An idempotent cleanup removing only this call's installations.
 * @throws {Error} If any operator conflicts; no registrations are changed.
 */
export const registerExtendedOperators = (): (() => void) => registerOperators(extendedOperators);
