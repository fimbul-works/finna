import type { DateOperator, FilterPredicate, FinnaContext, OperatorFactory } from "../../types.js";
import { registerOperators } from "../operator-registry.js";
import { createDateOfMonthPredicate } from "./date.js";
import { createHourPredicate } from "./hour.js";
import { createMinutePredicate } from "./minute.js";
import { createMonthPredicate } from "./month.js";
import { createMsPredicate } from "./ms.js";
import { createSecondPredicate } from "./second.js";
import { createUtcPredicate } from "./utc.js";
import { createWeekdayPredicate } from "./weekday.js";
import { createYearPredicate } from "./year.js";

export * from "./date.js";
export * from "./hour.js";
export * from "./minute.js";
export * from "./month.js";
export * from "./ms.js";
export * from "./second.js";
export * from "./second.js";
export * from "./utc.js";
export * from "./weekday.js";
export * from "./year.js";

export const dateOperators: ReadonlyMap<DateOperator, OperatorFactory> = new Map<DateOperator, OperatorFactory>([
  ["$date", createDateOfMonthPredicate],
  ["$hour", createHourPredicate],
  ["$minute", createMinutePredicate],
  ["$month", createMonthPredicate],
  ["$ms", createMsPredicate],
  ["$second", createSecondPredicate],
  ["$utc", createUtcPredicate],
  ["$weekday", createWeekdayPredicate],
  ["$year", createYearPredicate],
]);

/**
 * Creates a predicate using a built-in date factory without registering it.
 *
 * @param operator - The date operator to compile.
 * @param expected - The operator argument or nested filter.
 * @param ctx - Compilation context shared with the selected factory.
 * @returns The compiled predicate returned by the selected factory.
 * @throws {Error} If operator is not a built-in date operator, or its factory rejects the argument.
 */
export function createDatePredicate(operator: DateOperator, expected: any, ctx: FinnaContext): FilterPredicate {
  const factory = dateOperators.get(operator);
  if (!factory) throw new Error(`Invalid date query operator: ${operator}`);
  return factory(expected, ctx);
}

/**
 * Registers all built-in date operators atomically.
 *
 * @returns An idempotent cleanup function removing only operators installed by this call.
 * @throws {Error} If an operator name is already registered with a different factory.
 */
export const registerDateOperators = (): (() => void) => registerOperators(dateOperators);
