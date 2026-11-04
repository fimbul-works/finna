import type { EqualityOperator, FilterPredicate, FinnaContext, OperatorFactory } from "../../types.js";
import { registerOperators } from "../operator-registry.js";
import { createEqPredicate } from "./eq.js";
import { createInPredicate } from "./in.js";
import { createNePredicate } from "./ne.js";
import { createNinPredicate } from "./nin.js";

export * from "./eq.js";
export * from "./in.js";
export * from "./ne.js";
export * from "./nin.js";

export const equalityOperators: ReadonlyMap<EqualityOperator, OperatorFactory> = new Map<
  EqualityOperator,
  OperatorFactory
>([
  ["$eq", createEqPredicate],
  ["$in", createInPredicate],
  ["$ne", createNePredicate],
  ["$nin", createNinPredicate],
]);

/**
 * Creates a predicate using a built-in equality factory without registering it.
 *
 * @param operator - The equality operator to compile.
 * @param expected - The operator argument or nested filter.
 * @param ctx - Compilation context shared with the selected factory.
 * @returns The compiled predicate returned by the selected factory.
 * @throws {Error} If operator is not a built-in equality operator, or its factory rejects the argument.
 */
export function createEqualityPredicate(operator: EqualityOperator, expected: any, ctx: FinnaContext): FilterPredicate {
  const factory = equalityOperators.get(operator);
  if (!factory) throw new Error(`Invalid equality query operator: ${operator}`);
  return factory(expected, ctx);
}

/**
 * Registers all built-in equality operators atomically.
 *
 * @returns An idempotent cleanup function removing only operators installed by this call.
 * @throws {Error} If an operator name is already registered with a different factory.
 */
export const registerEqualityOperators = (): (() => void) => registerOperators(equalityOperators);
