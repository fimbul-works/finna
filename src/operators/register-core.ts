import type { OperatorFactory, OperatorName } from "../types.js";
import { arrayOperators } from "./array/index.js";
import { comparisonOperators } from "./comparison/index.js";
import { createExistsPredicate } from "./element/exists.js";
import { createTypePredicate } from "./element/type.js";
import { equalityOperators } from "./equality/index.js";
import { registerOperators } from "./operator-registry.js";
import { createRegexPredicate } from "./string/regex.js";

/** Equality, comparison, array, existence, type, and regular expression operators. */
export const coreOperators: ReadonlyMap<OperatorName, OperatorFactory> = new Map([
  ...equalityOperators,
  ...comparisonOperators,
  ...arrayOperators,
  ["$exists", createExistsPredicate],
  ["$type", createTypePredicate],
  ["$regex", createRegexPredicate],
]);

/**
 * Registers basic operators without importing dates or extended operators.
 * @returns An idempotent cleanup removing only this call's installations.
 * @throws {Error} If any operator conflicts; no registrations are changed.
 */
export const registerCoreOperators = (): (() => void) => registerOperators(coreOperators);
