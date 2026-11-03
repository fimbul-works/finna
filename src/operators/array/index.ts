import type { ArrayOperator, FilterPredicate, FinnaContext, OperatorMap } from "../../types.js";
import { registerOperators } from "../operator-registry.js";
import { createAllPredicate } from "./all.js";
import { createNonePredicate } from "./none.js";
import { createSizePredicate } from "./size.js";
import { createSomePredicate } from "./some.js";

export * from "./all.js";
export * from "./none.js";
export * from "./size.js";
export * from "./some.js";

const arrayOperators: OperatorMap<ArrayOperator> = new Map([
  ["$all", createAllPredicate],
  ["$none", createNonePredicate],
  ["$size", createSizePredicate],
  ["$some", createSomePredicate],
]);

/**
 * Creates a predicate using a built-in array factory without registering it.
 *
 * @param operator - The array operator to compile.
 * @param expected - The operator argument or nested filter.
 * @param ctx - Compilation context shared with the selected factory.
 * @returns The compiled predicate returned by the selected factory.
 * @throws {Error} If operator is not a built-in array operator, or its factory rejects the argument.
 */
export function createArrayPredicate(operator: ArrayOperator, expected: any, ctx: FinnaContext): FilterPredicate {
  const factory = arrayOperators.get(operator);
  if (!factory) throw new Error(`Invalid array query operator: ${operator}`);
  return factory(expected, ctx);
}

/**
 * Registers all built-in array operators atomically.
 *
 * @returns An idempotent cleanup function removing only operators installed by this call.
 * @throws {Error} If an operator name is already registered with a different factory.
 */
export const registerArrayOperators = (): (() => void) => registerOperators(arrayOperators);
