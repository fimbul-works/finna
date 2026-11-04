import { isFn, isStr } from "@fimbul-works/hvat";
import type { OperatorFactory, OperatorMap, OperatorName } from "../types.js";

const operators: OperatorMap = new Map();
const registrations = new Map<OperatorName, object>();

/** Read-only view of installed filter operators and their factories. */
export const operatorMap: ReadonlyMap<OperatorName, OperatorFactory> = operators;

/**
 * Checks whether a filter operator is installed.
 *
 * @param operator - The dollar-prefixed name to look up.
 * @returns True if the operator is currently registered.
 */
export const hasOperator = (operator: OperatorName): boolean => operators.has(operator);

/**
 * Looks up the factory for an installed filter operator.
 *
 * @param operator - The dollar-prefixed name to look up.
 * @returns The installed factory, or undefined if the operator is unavailable.
 */
export const getOperator = (operator: OperatorName): OperatorFactory | undefined => operators.get(operator);

/**
 * Copies the currently installed operator names and factories.
 *
 * @returns An independent map snapshot; modifying it does not affect the registry.
 */
export const listOperators = (): OperatorMap => new Map(operators);

/**
 * Registers one filter operator; identical registrations are no-ops.
 *
 * @param operator - A nonempty dollar-prefixed operator name.
 * @param factory - The function compiling an argument into a predicate.
 * @param options - Registration options; replacement is disabled by default.
 * @param options.replace - Whether to replace a different factory already registered under this name.
 * @returns An idempotent cleanup function that removes this installation without restoring a replaced factory.
 * @throws {TypeError} If the name or factory is invalid.
 * @throws {Error} If a different factory is already installed and replacement is disabled.
 */
export function registerOperator(
  operator: OperatorName,
  factory: OperatorFactory,
  options: { replace?: boolean } = {},
): () => void {
  return registerOperators([[operator, factory]], options);
}

/**
 * Registers a batch atomically; identical registrations are no-ops.
 *
 * @param entries - An iterable of dollar-prefixed operator names and their predicate factories.
 * @param options - Registration options; replacement is disabled by default.
 * @param options.replace - Whether conflicting factories may be replaced, including within the batch.
 * @returns An idempotent cleanup function that removes only this batch's installations, preserving later replacements.
 * @throws {TypeError} If a name or factory is invalid.
 * @throws {Error} If conflicting factories are found and replacement is disabled.
 */
export function registerOperators(
  entries: Iterable<readonly [OperatorName, OperatorFactory]>,
  options: { replace?: boolean } = {},
): () => void {
  const batch = new Map<OperatorName, OperatorFactory>();

  for (const [operator, factory] of entries) {
    if (!isStr(operator) || !operator.startsWith("$") || operator.length === 1 || !isFn(factory)) {
      throw new TypeError("An operator registration requires a $name and a predicate factory");
    }

    const existing = batch.get(operator) ?? operators.get(operator);
    if (existing && existing !== factory && !options.replace) {
      throw new Error(`Operator already registered: ${operator}`);
    }

    batch.set(operator, factory);
  }

  const token = {};
  const installed: OperatorName[] = [];

  for (const [operator, factory] of batch) {
    if (operators.get(operator) === factory) continue;
    operators.set(operator, factory);
    registrations.set(operator, token);
    installed.push(operator);
  }

  let active = true;
  return () => {
    if (!active) return;
    active = false;
    for (const operator of installed) {
      if (registrations.get(operator) === token) unregisterOperator(operator);
    }
  };
}

/**
 * Removes a registered filter operator by name.
 *
 * @param operator - The dollar-prefixed name to remove.
 * @returns True if an installed operator was removed; otherwise false.
 */
export function unregisterOperator(operator: OperatorName): boolean {
  registrations.delete(operator);
  return operators.delete(operator);
}
/**
 * Removes every installed filter operator and its registration ownership.
 *
 * @returns Nothing. Previously compiled predicates remain usable.
 */
export function clearOperators(): void {
  operators.clear();
  registrations.clear();
}
