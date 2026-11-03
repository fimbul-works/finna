import type { ElementOperator, FilterPredicate, FinnaContext, OperatorMap } from "../../types.js";
import { registerOperators } from "../operator-registry.js";
import { createExistsPredicate } from "./exists.js";
import { createFalsyPredicate } from "./falsy.js";
import { createNullishPredicate } from "./nullish.js";
import { createTruthyPredicate } from "./truthy.js";
import { createTypePredicate } from "./type.js";

export * from "./exists.js";
export * from "./falsy.js";
export * from "./nullish.js";
export * from "./truthy.js";
export * from "./type.js";

const elementOperators: OperatorMap<ElementOperator> = new Map([
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
