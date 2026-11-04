import type { FilterPredicate, FinnaContext, OperatorFactory, StringOperator } from "../../types.js";
import { registerOperators } from "../operator-registry.js";
import { createEndsWithPredicate } from "./endsWith.js";
import { createIncludesPredicate } from "./includes.js";
import { createLowercasePredicate } from "./lowercase.js";
import { createRegexPredicate } from "./regex.js";
import { createReplacePredicate } from "./replace.js";
import { createReplaceAllPredicate } from "./replaceAll.js";
import { createStartsWithPredicate } from "./startsWith.js";
import { createUppercasePredicate } from "./uppercase.js";

export * from "./endsWith.js";
export * from "./includes.js";
export * from "./lowercase.js";
export * from "./regex.js";
export * from "./replace.js";
export * from "./replaceAll.js";
export * from "./startsWith.js";
export * from "./uppercase.js";

export const stringOperators: ReadonlyMap<StringOperator, OperatorFactory> = new Map<StringOperator, OperatorFactory>([
  ["$endsWith", createEndsWithPredicate],
  ["$includes", createIncludesPredicate],
  ["$regex", createRegexPredicate],
  ["$uppercase", createUppercasePredicate],
  ["$lowercase", createLowercasePredicate],
  ["$replace", createReplacePredicate],
  ["$replaceAll", createReplaceAllPredicate],
  ["$startsWith", createStartsWithPredicate],
]);

/**
 * Creates a predicate using a built-in string factory without registering it.
 *
 * @param operator - The string operator to compile.
 * @param expected - The operator argument or nested filter.
 * @param ctx - Compilation context shared with the selected factory.
 * @returns The compiled predicate returned by the selected factory.
 * @throws {Error} If operator is not a built-in string operator, or its factory rejects the argument.
 */
export function createStringPredicate(operator: StringOperator, expected: any, ctx: FinnaContext): FilterPredicate {
  const factory = stringOperators.get(operator);
  if (!factory) throw new Error(`Invalid string query operator: ${operator}`);
  return factory(expected, ctx);
}

/**
 * Registers all built-in string operators atomically.
 *
 * @returns An idempotent cleanup function removing only operators installed by this call.
 * @throws {Error} If an operator name is already registered with a different factory.
 */
export const registerStringOperators = (): (() => void) => registerOperators(stringOperators);
