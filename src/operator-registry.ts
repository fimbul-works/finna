import {
  registerComparisonOperators,
  registerEqualityOperators,
  registerArrayOperators,
  registerDateOperators,
  registerElementOperators,
  registerStringOperators,
} from "./operators/index.js";
import type { OperatorGroupTuple } from "./types.js";

/**
 * Registry set of operator group tuples.
 */
export const operatorGroups = new Set<OperatorGroupTuple>();

/**
 * Registers an operator group tuple in the registry.
 *
 * @param {OperatorGroupTuple} operatorGroupTuple - Operator group tuple to register
 * @returns {() => void} Unregister function
 */
export function registerOperators(operatorGroupTuple: OperatorGroupTuple): () => void {
  let entry: OperatorGroupTuple;
  if (Array.isArray(operatorGroupTuple)) {
    entry = operatorGroupTuple;
  } else {
    throw new Error("Invalid operator group registration");
  }

  // Prevent duplicate registrations for identical match/register pairs
  for (const existing of operatorGroups) {
    const [existingMatches, existingRegister] = existing;
    const [newMatches, newRegister] = entry;

    if (existingMatches === newMatches && existingRegister === newRegister) {
      return () => {
        operatorGroups.delete(existing);
      };
    }
  }

  operatorGroups.add(entry);
  return () => {
    operatorGroups.delete(entry);
  };
}

/**
 * Unregisters an operator group tuple from the registry.
 *
 * @param {OperatorGroupTuple} operatorGroupTuple - Operator group tuple to unregister
 * @returns {boolean} True if group was found and removed
 */
export function unregisterOperators(operatorGroupTuple: OperatorGroupTuple): boolean {
  return operatorGroups.delete(operatorGroupTuple);
}

/**
 * Clears all registered operator groups.
 */
export function clearOperators(): void {
  operatorGroups.clear();
}

/**
 * Registers all built-in operator groups into the query engine.
 */
export function registerAllOperators(): void {
  registerEqualityOperators();
  registerComparisonOperators();
  registerElementOperators();
  registerStringOperators();
  registerDateOperators();
  registerArrayOperators();
}
